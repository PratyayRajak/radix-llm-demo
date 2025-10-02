pub fn instantiate_faucet() -> Global<Faucet> {
            // Create a new fungible token
            let token_bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata("name", "FaucetToken")
                .metadata("symbol", "FCT")
                .divisibility(DIVISIBILITY_MAXIMUM)
                .mint_initial_supply(1_000_000);

            let faucet_token = token_bucket.resource_address();

            // Instantiate the component
            Self {
                token_vault: Vault::with_bucket(token_bucket),
                faucet_token,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::None)
            .globalize()
        }

        pub fn request_tokens(&mut self) -> Bucket {
            // Define the fixed amount to dispense
            let amount: Decimal = dec!(100);

            // Ensure the vault has enough tokens
            assert!(
                self.token_vault.amount() >= amount,
                "Faucet is empty or insufficient tokens"
            );

            // Dispense tokens
            self.token_vault.take(amount)
        }

        pub fn get_token_address(&self) -> ResourceAddress {
            self.faucet_token
        }
    }
}

🧪 Unit Test

You can add a test in tests/faucet_test.rs:

use scrypto::prelude::*;
use scrypto_unit::*;
use transaction::prelude::*;

#[test]
fn test_faucet_dispenses_tokens() {
    // Set up test environment
    let mut test_runner = TestRunner::builder().build();
    let package_address = test_runner.compile_and_publish(this_package!());

    // Instantiate the faucet component
    let manifest = ManifestBuilder::new()
        .call_function(package_address, "Faucet", "instantiate_faucet", manifest_args![])
        .build();
    let receipt = test_runner.execute_manifest_ignoring_fee(manifest, vec![]);
    let faucet_component = receipt.expect_commit().new_component_addresses()[0];

    // Call request_tokens
    let manifest = ManifestBuilder::new()
        .call_method(faucet_component, "request_tokens", manifest_args![])
        .build();
    let receipt = test_runner.execute_manifest_ignoring_fee(manifest, vec![]);

    // Check that the user received 100 tokens
    let output = receipt.expect_commit().output(1);
    let bucket: Bucket = output.expect("Expected a Bucket");
    assert_eq!(bucket.amount(), dec!(100));
}

🛠️ Troubleshooting Docker Error

The error you encountered:

docker: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.

This indicates that Docker is not running or not installed properly on your system. To resolve:

- Ensure Docker Desktop is installed.
- Start Docker Desktop.
- Run docker info to verify Docker is running.
- Retry your cargo test or scrypto test command.

✅ Summary

- The blueprint defines a simple faucet that mints and dispenses tokens.
- The test verifies that the faucet dispenses the correct amount.
- Ensure Docker is running for Scrypto to compile and test properly.

Let me know if you'd like to extend this faucet with rate limiting or access control!