# Discord Bot Test

## Requirements
- [pnpm](https://pnpm.io/)
- [bun](https://bun.sh/)

## Installation

```bash
pnpm install
```

## Setup

### Google Cloud

- Create a new project in Google Cloud
- Enable the following APIs:
  - Sheets API
- Create a new service account and download the credentials file
- Save the credentials file in the `.secrets/` directory under the name `google-service-account.json`
  
### Update .env
- copy `.env.example` to `.env` and update the variables

### Database Migrations

```bash
pnpm run migrate latest
```

## Running

```bash
pnpm run dev
```

Enjoy 😄