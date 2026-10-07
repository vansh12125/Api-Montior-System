import { UAParser } from "ua-parser-js";

const getClientInfo = (req) => {
  const parser = new UAParser(req.get("user-agent"));
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  return {
    ipAddress: req.ip,
    browser: browser.name ?? "Unknown",
    browserVersion: browser.version ?? "Unknown",
    os: os.name ?? "Unknown",
    osVersion: os.version ?? "Unknown",
    device: device.type ?? "Desktop",
  };
};

export { getClientInfo };
