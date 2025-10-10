type CookieOptions = {
  maxAge?: number;
  path?: string;
};

const encode = (value: string) => encodeURIComponent(value);
const decode = (value: string) => decodeURIComponent(value);

export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  const parts = [`${encode(name)}=${encode(value)}`];

  if (options.maxAge) {
    parts.push(`max-age=${options.maxAge}`);
  }

  parts.push(`path=${options.path ?? "/"}`);

  document.cookie = parts.join("; ");
};

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const target = cookies.find((cookie) => cookie.startsWith(`${encodeURIComponent(name)}=`));
  if (!target) return null;
  const [, value] = target.split("=");
  return value ? decode(value) : null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${encode(name)}=; max-age=0; path=/`;
};
