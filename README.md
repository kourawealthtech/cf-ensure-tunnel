# Create Tunnel Action for GitHub

Creates CloudFlare ZeroTrust Tunnel with a given name. Outputs tunnel's token and id.

## Usage via Github Actions

```yaml
name: example
on: pull_request
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: kourawealthtech/cf-ensure-tunnel@v1.0
        with:
          name: "some-tunnel-name"
          config: "cloudflare"
          account_id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          token: ${{ secrets.CLOUDFLARE_TOKEN }}
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
