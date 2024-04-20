import { createContext } from "react";
import { defaultClientManagement } from "chess/lib/constants/ContextConstants";
import { ClientManagement } from "chess/lib/constants/SessionConstants";

export const ClientManagementContext = createContext<ClientManagement>(defaultClientManagement);