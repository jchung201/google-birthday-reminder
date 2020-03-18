import { types, flow } from "mobx-state-tree";
import { API_URL, WEB_URL } from "../utilities/URL";
import axios from "axios";

const Auth = types
  .model({
    loggedIn: types.optional(types.boolean, false),
    access_token: types.optional(types.string, ""),
    refresh_token: types.optional(types.string, ""),
    scope: types.optional(types.string, ""),
    token_type: types.optional(types.string, ""),
    expiry_date: types.optional(types.string, "")
  })
  .actions(self => ({
    authenticate: function() {
      const access_token = localStorage.getItem("access_token");
      const refresh_token = localStorage.getItem("refresh_token");
      const scope = localStorage.getItem("scope");
      const token_type = localStorage.getItem("token_type");
      const expiry_date = localStorage.getItem("expiry_date");
      if (access_token && refresh_token && scope && token_type && expiry_date) {
        self.logIn();
      } else {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        let code = params.get("code");
        if (code) {
          axios
            .post(`${API_URL}/rest/auth/token`, { code })
            .then(
              ({
                data: {
                  access_token,
                  refresh_token,
                  scope,
                  token_type,
                  expiry_date
                }
              }) => {
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);
                localStorage.setItem("scope", scope);
                localStorage.setItem("token_type", token_type);
                localStorage.setItem("expiry_date", expiry_date);
                self.logIn();
                window.location = WEB_URL;
              }
            )
            .catch(error => {
              console.error(error);
              self.logOut();
            });
        } else {
          self.logOut();
        }
      }
    },
    logIn() {
      self.loggedIn = true;
    },
    logOut() {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("scope");
      localStorage.removeItem("token_type");
      localStorage.removeItem("expiry_date");
      self.loggedIn = false;
    }
  }));

const Birthday = types.model({
  id: types.string
});
const Calendar = types
  .model({
    birthdays: types.optional(types.array(Birthday), []),
    auth: types.optional(Auth, {})
  })
  .actions(self => ({
    fetchBirthdays() {
      const access_token = localStorage.getItem("access_token");
      const refresh_token = localStorage.getItem("refresh_token");
      const scope = localStorage.getItem("scope");
      const token_type = localStorage.getItem("token_type");
      const expiry_date = localStorage.getItem("expiry_date");

      if (access_token && refresh_token && scope && token_type && expiry_date) {
        axios
          .get(`${API_URL}/rest/birthdays/`, {
            headers: {
              Authorization: JSON.stringify({
                access_token,
                refresh_token,
                scope,
                token_type,
                expiry_date
              })
            }
          })
          .then(({ data }) => {
            console.log(data);
            self.setBirthdays(data);
            // this.setState({ dates: data, loading: false });
          })
          .catch(error => {
            console.error(error);
            self.auth.logOut();
          });
      } else {
        self.auth.logOut();
      }
    },
    setBirthdays(list) {
      self.birthdays = list;
    }
  }));

const Root = types.model({
  auth: types.optional(Auth, {}),
  calendar: types.optional(Calendar, {})
});

export const store = Root.create({
  auth: { loggedIn: false }
});
