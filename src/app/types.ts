export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  googleId?: string;
  mobileNumber?: string;
  isVerifiedEmail: boolean;
  partnerOnboardingSteps?: number;
  rejectedReason?: string;
  partnerStatus?: string;
  image?: string;
  role: "user" | "partner" | "admin";

  videoKycStatus?:
    | "not_requested"
    | "pending"
    | "in_progress"
    | "approved"
    | "rejected";
  videoKycRoomId?: string;
  videoKycRejectedReason?: string;
  location?: {
    coordinates: [number, number];
  };
  isOnline: boolean;
  updatedAt: Date;
}

type VehicleType = "car" | "bike" | "loading" | "truck" | "auto";

export interface IVehicle {
  _id?: string;
  owner: string;
  type: VehicleType;
  vehcleModel: string;
  number: string;
  imageUrl?: {
    public_id: string;
    url: string;
  };
  baseFare?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  reasonForRejection?: string;
  vehiclePhoto?: {
    public_id: string;
    url: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IBookingStatus =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type IPaymentStatus = "pending" | "paid" | "cash" | "failed";

export interface IBooking {
  _id: string;
  userId: string;
  driverId: string;
  vehicleId: string;

  pickupAddress: string;
  dropAddress: string;

  pickupLocation: {
    coordinates: [number, number];
  };

  dropLocation: {
    coordinates: [number, number];
  };
  distance?: number;

  fare: number;

  userMobileNumber: string;
  driverMobileNumber: string;

  bookingStatus: IBookingStatus;
  paymentStatus?: IPaymentStatus;

  adminCommission?: number;
  partnerAmount?: number;

  pickupOtp?: string;
  pickupOtpExpires?: Date;

  dropOtp?: string;
  dropOtpExpires?: Date;
  paymentDeadline?: Date;

  paymentStatusForOnline?: "pending" | "paid" | "failed";
  paymentMethod?: "online" | "cod";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  totalFare?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessage {
  bookingId: string;

  senderId: string;
  receiverId: string;

  role: "user" | "partner";

  text: string;

  createdAt?: Date;
  updatedAt?: Date;
}
