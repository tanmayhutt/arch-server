# Tailscale workload identity setup

The deployment workflow uses GitHub OIDC workload identity federation. GitHub does not need a reusable Tailscale auth key. Each job receives a short-lived GitHub identity token, joins the tailnet as an ephemeral `tag:ci` node, connects to the Arch server over ordinary OpenSSH, and disappears after the job.

Do not push the workflow change until the trust credential, tags, grants, and GitHub values below are configured. Keep an existing administrative SSH session open while testing policy changes.

## 1. Prepare the tailnet tags and grant

Merge the following concepts into the existing tailnet policy. Do not replace an existing policy wholesale.

```json
{
  "tagOwners": {
    "tag:ci": ["autogroup:admin"],
    "tag:arch-server": ["autogroup:admin"]
  },

  "grants": [
    {
      "src": ["tag:ci"],
      "dst": ["tag:arch-server"],
      "ip": ["tcp:22"]
    }
  ]
}
```

If `tagOwners` or `grants` already exist, add entries to those existing objects and arrays. Preserve the rules that allow Tanmay's own devices to reach the server. The CI grant must not include Samba, the Docker service, or other tailnet devices.

Assign `tag:arch-server` to the Lenovo only after the personal administration rules have been checked. Applying a tag changes the device from user-owned to tag-owned policy identity.

## 2. Create the GitHub federated identity in Tailscale

In the Tailscale admin console, open the trust credentials or workload identity federation area and create a GitHub Actions identity.

Configure it with:

- GitHub's Actions OIDC issuer.
- Repository restricted to `tanmayhutt/arch-server`.
- The `main` branch or the production deployment context where the console supports claim restrictions.
- Writable `auth_keys` scope.
- Permission to create only `tag:ci` devices.

Do not allow the credential to create administrator, personal-device, storage, or general-server tags.

Record the generated client ID and audience. No Tailscale OAuth client secret is used by this workflow.

## 3. Add the GitHub values

In the GitHub repository, open **Settings → Secrets and variables → Actions** and add:

- `TS_OAUTH_CLIENT_ID`: the federated identity client ID.
- `TS_AUDIENCE`: the audience configured for that identity.

The workflow already retains these existing deployment secrets:

- `SERVER_IP`: the Lenovo's private Tailscale address or resolvable tailnet name.
- `SERVER_USER`: the deployment SSH account.
- `SERVER_SSH_KEY`: that account's SSH private key.
- `CLOUDFLARE_TUNNEL_TOKEN`: used to reconstruct the ignored server `.env` file.

## 4. Test the migration

1. Validate and save the tailnet policy.
2. Confirm Tanmay's existing device can still reach the Lenovo over SSH.
3. Add the two GitHub values.
4. Push the prepared workflow change.
5. Confirm the action creates an ephemeral node tagged `tag:ci`.
6. Confirm the Tailscale action's `ping` check reaches the Lenovo.
7. Confirm the SSH deployment and public-site verification succeed.
8. Confirm `tag:ci` cannot reach Samba or unrelated devices.
9. Confirm the ephemeral runner disappears after the job.
10. Revoke the old Tailscale auth key and delete `TAILSCALE_AUTHKEY` from GitHub Actions secrets.

## 5. Recovery

If the first OIDC deployment fails, do not weaken the tailnet grant. Inspect whether the failure is caused by the federated identity claims, allowed tag, missing GitHub value, server tag, or TCP 22 grant. The old auth key should remain available only until the OIDC deployment has succeeded, then it should be revoked.

Official references:

- [Tailscale GitHub Action](https://github.com/tailscale/github-action)
- [Workload identity federation](https://tailscale.com/kb/1581/workload-identity-federation)
- [Trust credentials](https://tailscale.com/kb/1623/trust-credentials)
- [Tags](https://tailscale.com/kb/1068/tags)
- [Grants syntax](https://tailscale.com/kb/1538/grants-syntax)
