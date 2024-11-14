# Workevent Frontend

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example with-docker-multi-env nextjs-docker-multi-env
# or
yarn create next-app --example with-docker-multi-env nextjs-docker-multi-env
# or
pnpm create next-app --example with-docker-multi-env nextjs-docker-multi-env
```

Enter the values in the `.env.development.sample`, `.env.staging.sample`, `.env.production.sample` files to be used for each environments.

## Using Docker and Makefile

### Development environment - for doing testing

```
make build-development
make start-development
```

Open http://localhost:3001

### Staging environment - for doing UAT testing

```
make build-staging
make start-staging
```

Open http://localhost:3002

### Production environment - for users

```
make build-production
make start-production
```

Open http://localhost:3003

## Running Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.