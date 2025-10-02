use scrypto::prelude::*;

#[blueprint]
mod token_faucet {
    struct TokenFaucet {
        token_vault: Vault,
        faucet_token: ResourceAddress,
    }

    impl TokenFaucet {
        pub fn instantiate_faucet() -> Global<TokenFaucet> {
            // Create a new fungible token with 18 decimals
            let (faucet_token_address, bucket) = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata("name", "FaucetToken")
                .metadata("symbol", "FAUCET")
                .metadata("description", "A simple faucet token")
                .divisibility(DIVISIBILITY_MAXIMUM)
                .mint_initial_supply(1_000_000);

            // Store the tokens in a vault
            let token_vault = Vault::with_bucket(bucket);

            // Instantiate the component
            Self {
                token_vault,
                faucet_token: faucet_token_address,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        pub fn claim_tokens(&mut self) -> Bucket {
            // Check if the faucet has enough tokens
            assert!(
                self.token_vault.amount() >= 10,
                "Faucet is empty or does not have enough tokens"
            );

            // Dispense 10 tokens
            self.token_vault.take(10)
        }

        pub fn get_token_address(&self) -> ResourceAddress {
            self.faucet_token
        }
    }
}
