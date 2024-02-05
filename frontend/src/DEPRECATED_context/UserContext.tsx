import React, { useState } from "react";

import { UserApi } from "../DEPRECATED_common/DEPRECATED_api/user";
import noop from "../DEPRECATED_common/helpers";

export interface UserDTO {
  name: string;
  id: number;
  surname?: string;
  email?: string;
  username: string;
}
export interface UserAPIDTO {
  total_items: number;
  total_pages: number;
  page: number;
  items: UserDTO[];
}
export interface UserAPIRequestAndResponse {
  username: string;
  password?: string;
  confirm_password?: string;
  name: string;
  surname?: string;
  email?: string;
  id?: number;
}

export interface APIErrorDetails {
  ctx: { error: any };
  input: string;
  loc: string[];
  msg: string;
  type: string;
  url: string;
}

export interface UserAPIErrorResponse {
  details: APIErrorDetails[];
}

interface UserContextProps {
  getUsers: () => void;
  users: UserDTO[];
}

interface UserContextProviderProps {
  children: React.ReactNode;
}

const UserContext = React.createContext<UserContextProps>({
  getUsers: noop,
  users: [],
});

export function UserContextProvider(props: UserContextProviderProps): React.ReactElement {
  const { children } = props;

  const [users, setUsers] = useState<UserDTO[]>([]);

  const getUsers = async () => {
    const { items } = await UserApi.getUsers();
    if (items) {
      setUsers(items as UserDTO[]);
    }
  };
  return <UserContext.Provider value={{ getUsers, users }}>{children}</UserContext.Provider>;
}

export default UserContext;
