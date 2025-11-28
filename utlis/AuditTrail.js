import AuditTrail from "../models/AuditTrailShema.js";
import SubUser from "../models/subUserSchema.js";

export async function observeAuditTrail(mainUser, userid, usertype, action, module, targetId) {
  let user;
  let admin;

  if (usertype === "admin") {
    admin = true;
  } else {
    admin = false;
    
  }

  const newAuditTrail = new AuditTrail({
    user: mainUser,
    action: action,
    module: module,
    targetId: targetId,
    after: null,
    admin: admin,
    applicant: userid
  });

  await newAuditTrail.save();

}

export default observeAuditTrail;