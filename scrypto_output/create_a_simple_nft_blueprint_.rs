use scrypto::prelude::*;

#[blueprint]
mod simple_nft {
    struct SimpleNFT {
        // Vault to hold the NFT resource
        nft_vault: Vault,
        // The resource address of the NFT
        nft_resource_address: ResourceAddress,
    }

    impl SimpleNFT {
        pub fn instantiate_component() -> Global<SimpleNFT> {
            // Define the NFT resource with non-fungible id as UUID and single ownership
            let (resource_address, bucket) = ResourceBuilder::new_non_fungible()
                .metadata("name", "SimpleNFT")
                .metadata("symbol", "SNFT")
                .mint_roles(mint_roles! {
                    minter => rule!(require(global_caller()));
                    // Only the component itself can mint
                    others => deny_all;
                })
                .burn_roles(burn_roles! {
                    burner => rule!(allow_all);
                    others => deny_all;
                })
                .non_fungible_data::<Empty>()
                .no_initial_supply();

            Self {
                nft_vault: Vault::new(resource_address),
                nft_resource_address: resource_address,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        /// Mints a new NFT and returns it in a Bucket
        pub fn mint_nft(&mut self) -> Bucket {
            let nft_id = NonFungibleLocalId::random();
            let nft = self
                .nft_resource_address
                .mint_non_fungible(&nft_id, Empty {});
            nft
        }

        /// Accepts an NFT and transfers it to the component's vault
        pub fn deposit_nft(&mut self, nft: Bucket) {
            assert!(
                nft.resource_address() == self.nft_resource_address,
                "Wrong NFT resource"
            );
            self.nft_vault.put(nft);
        }

        /// Withdraws an NFT by ID from the component's vault and returns it
        pub fn withdraw_nft(&mut self, nft_id: NonFungibleLocalId) -> Bucket {
            self.nft_vault
                .take_non_fungible(&nft_id)
                .expect("NFT not found in vault")
        }

        /// Returns the resource address of the NFT
        pub fn get_nft_resource_address(&self) -> ResourceAddress {
            self.nft_resource_address
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use scrypto::prelude::*;

    #[test]
    fn test_mint_and_transfer_nft() {
        // Instantiate the component
        let mut test_env = TestEnvironment::new();
        let component = SimpleNFT::instantiate_component();

        // Mint an NFT
        let mut component_ref = component.clone();
        let nft_bucket = component_ref.mint_nft();

        // Check that the NFT is of correct type
        assert_eq!(
            nft_bucket.resource_address(),
            component_ref.get_nft_resource_address()
        );
        assert_eq!(nft_bucket.amount(), Decimal::one());

        // Extract NFT ID
        let nft_ids: Vec<NonFungibleLocalId> = nft_bucket
            .non_fungible_local_ids()
            .into_iter()
            .collect();
        assert_eq!(nft_ids.len(), 1);
        let nft_id = nft_ids[0].clone();

        // Deposit the NFT into the component
        component_ref.deposit_nft(nft_bucket);

        // Withdraw the NFT back
        let returned_nft = component_ref.withdraw_nft(nft_id.clone());

        // Check that the returned NFT has the same ID
        let returned_ids: Vec<NonFungibleLocalId> = returned_nft
            .non_fungible_local_ids()
            .into_iter()
            .collect();
        assert_eq!(returned_ids.len(), 1);
        assert_eq!(returned_ids[0], nft_id);
    }

    // Helper struct for testing
    struct TestEnvironment;

    impl TestEnvironment {
        pub fn new() -> Self {
            Self {}
        }
    }
}