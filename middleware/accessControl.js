// import UAParser from 'ua-parser-js';
// import dotenv from "dotenv";

// dotenv.config();

// const accessControl = (req, res, next) => {
//     const userAgentString = req.headers['user-agent'];
//     const parser = new UAParser();
//     const agent = parser.setUA(userAgentString).getResult();

//     const isGoogleChrome = agent.browser.name === 'Chrome';
//     const isMobileDevice = userAgentString.includes('Mobile');
//     const isOTPValidated = req.headers['x-otp-validated'] === process.env.HEADER;

//     req.deviceType = 'Other';

//     if (isMobileDevice) {
//         const currentHour = new Date().getHours();
//         if (currentHour < 15 || currentHour > 20) {
//             return res.status(403).json({ message: "Access restricted for mobile devices outside 10 AM to 1 PM." });
//         }
//         req.deviceType = 'Mobile';
//     }

//     if (isGoogleChrome) {
//         if (isOTPValidated) {
//             return next();
//         } else {
//             return res.status(401).json({ message: "OTP authentication required for Google Chrome users.", fromAccessControl: true });
//         }
//     } else {
//         req.browserType = 'Other';
//         return next();
//     }
// };

// export default accessControl;

import UAParser from 'ua-parser-js';
import dotenv from "dotenv";
import DeviceDetector from "node-device-detector";

dotenv.config();

const accessControl = (req, res, next) => {
    const detector = new DeviceDetector();
    const userAgentString = req.headers['user-agent'];
    const parser = new UAParser();
    const agent = parser.setUA(userAgentString).getResult();
    const result = detector.detect(userAgentString);

    const isGoogleChrome = agent.browser.name === 'Chrome';
    const isMobileDevice = result.device && result.device.type === 'smartphone'; // Assuming this is the correct way to detect mobile devices
    const isOTPValidated = req.headers['x-otp-validated'] === process.env.HEADER;

    req.deviceType = 'Other';
    req.browserType = agent.browser.name || 'Other';

    console.log(`User Agent: ${userAgentString}`);
    console.log(`Detected Browser: ${agent.browser.name}`);
    console.log(`Detected Device Type: ${result.device.type}`);
    console.log(`Is Mobile Device: ${isMobileDevice}`);
    console.log(`OTP Validated: ${isOTPValidated}`);

    if (isMobileDevice) {
        const currentHour = new Date().getHours();
        console.log(`Current Hour: ${currentHour}`);
        if (currentHour < 15 || currentHour > 20) {
            console.log("Access restricted for mobile devices outside 3 PM to 8 PM.");
            return res.status(403).json({ message: "Access restricted for mobile devices outside 3 PM to 8 PM." });
        }
        req.deviceType = 'Mobile';
    }

    if (isGoogleChrome) {
        if (isOTPValidated) {
            console.log("Access granted for Google Chrome user with OTP validation.");
            return next();
        } else {
            console.log("Access denied for Google Chrome user without OTP validation.");
            return res.status(401).json({ message: "OTP authentication required for Google Chrome users.", fromAccessControl: true });
        }
    } else {
        console.log("Access granted for non-Google Chrome browser.");
        return next();
    }
};

export default accessControl;
