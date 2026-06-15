import { 
  type ApiOverview, 
  type ApiGroup, 
  type ApiEndpoint, 
  type ApiParameter, 
  type ApiResponseSample, 
  type ApiProduct 
} from "@/server/db/schemas/api.schema";

export type {
  ApiOverview,
  ApiGroup,
  ApiEndpoint,
  ApiParameter,
  ApiResponseSample,
  ApiProduct
};

export type ApiEndpointWithGroup = ApiEndpoint & {
  groupName?: string;
};
