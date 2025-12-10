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
    throw new Error("Invalid reason or model type.");
  }

  const prefix = prefixMap[reason];
  const model = modelMap[reason];
  const year = new Date().getFullYear().toString().slice(-2);
  const regex = new RegExp(`^${prefix}-${year}-\\d{5}$`);

  const field = reason === "Pin" ? "pinId" : "subid";
   let lastRecord = await model
    .findOne({ [field]: { $regex: regex } })
    .sort({ createdAt: -1 })
    .lean();

  let lastNumber = 0;
  if (lastRecord?.[field]) {
    const match = lastRecord[field].match(/-(\d{5})$/);
    if (match) lastNumber = parseInt(match[1], 10);
  }

  let newId = `${prefix}-${year}-${(lastNumber + 1).toString().padStart(5, "0")}`;

  // retry لو حصل تصادم نادر
  let attempts = 0;
  while (await model.findOne({ [field]: newId }) && attempts < 5) {
    const random = crypto.randomInt(0, 99999).toString().padStart(5, "0");
    newId = `${prefix}-${year}-${random}`;
    attempts++;
  }

  if (attempts === 5) throw new Error("Cannot generate unique ID");

  return newId;
}



export default [createID, newUserID];

