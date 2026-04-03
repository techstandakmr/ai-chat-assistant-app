import mongoose from "mongoose"

const otpSchema = new mongoose.Schema({
  // email address to which the OTP is sent
  email: {
    type: String,
    required: true,
  },
  // the OTP code itself
  code: {
    type: String,
    required: true,
  },
  // expiration time for the OTP, after which it becomes invalid
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, 
});

const OTPModel = mongoose.model("OTP", otpSchema);
export default OTPModel;
