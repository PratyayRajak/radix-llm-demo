pub fn new(faucet_amount: Decimal) -> Global<TokenFaucet> {
            // Create a new fungible token resource
            let token_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata("name", "FaucetToken")
                .metadata("symbol", "FTK")
                .metadata("description", "A simple faucet token")
                .mint_initial_supply(1_000_000);

            // Instantiate the component with the token vault and faucet amount
            Self {
                token_vault: Vault::with_bucket(token_bucket),
                faucet_amount,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        /// Dispenses a fixed amount of tokens to the caller
        pub fn claim_tokens(&mut self) -> Bucket {
            assert!(
                self.token_vault.amount() >= self.faucet_amount,
                "Faucet is empty or insufficient tokens available"
            );

            self.token_vault.take(self.faucet_amount)
        }
    }
}

🧪 Unit Test

To test this blueprint, create a test file in tests/token_faucet.rs:

use scrypto::prelude::*;
use scrypto::runtime::*;
use scrypto_test::prelude::*;

#[test]
fn test_token_faucet_claim() {
    // Set up test environment
    let mut test_env = TestEnvironment::new();

    // Publish the package
    let package_address = test_env.publish_package(include_code!(".."));

    // Instantiate the component
    let faucet_amount = dec!(100);
    let component = test_env.call_function::<GlobalAddress>(
       