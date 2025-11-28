import crypto from "crypto";
import User from "../models/UserSchema.js";
import Pin from "../models/pinSchema.js";

const prefixMap = {

  User: "USR",
  Pin: "PIN",

};

const modelMap = {
  Pin,
};

export async function newUserID() {
  const prefix = "USR";
  const year = new Date().getFullYear().toString().slice(-2);

  while (true) {
    const randomNumber = crypto.randomInt(0, 99999).toString().padStart(5, "0");
    const subid = `${prefix}-${year}-${randomNumber}`;

    const isExist = await User.findOne({ subid });
    if (!isExist) {
      return subid;
    }
  }
}


export async function createID(reason) {
  if (!reason || !prefixMap[reason] || !modelMap[reason]) {
    throw new Error("  Invalid reason or model type.");
  }

  const prefix = prefixMap[reason];
  const model = modelMap[reason];
  const year = new Date().getFullYear().toString().slice(-2);
  const regex = new RegExp(`^${prefix}-${year}-\\d{5}$`);

  let lastRecord = await model.findOne({ subid: { $regex: regex } }).sort({ createdAt: -1 }).lean();

  let lastNumber = 0;
  if (lastRecord?.subid) {
    const match = lastRecord.subid.match(/-(\d{5})$/);
    if (match) lastNumber = parseInt(match[1], 10);
  }

  let newNumber = (lastNumber + 1).toString().padStart(5, "0");
  let newSubId = `${prefix}-${year}-${newNumber}`;

  let exists = await model.findOne({ subid: newSubId });
  if (exists) {
    const randomNumber = crypto.randomInt(0, 99999).toString().padStart(5, "0");
    newSubId = `${prefix}-${year}-${randomNumber}`;
    exists = await model.findOne({ subid: newSubId });

    if (exists) return await createID(reason, userId);
  }

  return newSubId;
}

export default [createID, newUserID];

