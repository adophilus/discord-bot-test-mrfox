import { env } from "../env";

const EnvironmentConfig = {
	PRODUCTION: env.NODE_ENV === "production",
	STAGING: env.NODE_ENV === "staging",
	DEVELOPMENT: env.NODE_ENV === "development",
	TEST: env.NODE_ENV === "test",
};

export default EnvironmentConfig;
