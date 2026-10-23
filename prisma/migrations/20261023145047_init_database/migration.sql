-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Web', 'Mobile');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('Motorcycle', 'Car');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('Gasoline_90', 'Gasoline_92', 'Diesel', 'Electric');

-- CreateEnum
CREATE TYPE "EmissionCategory" AS ENUM ('Scope_3');

-- CreateEnum
CREATE TYPE "GeofenceLabel" AS ENUM ('Unpad', 'Pribadi');

-- CreateTable
CREATE TABLE "User" (
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserStudent" (
    "npm" CHAR(12) NOT NULL,
    "faculty" VARCHAR(255) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "UserStudent_pkey" PRIMARY KEY ("npm")
);

-- CreateTable
CREATE TABLE "StudentVehicle" (
    "vehicle_id" TEXT NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "engine_capacity" INTEGER NOT NULL,
    "fuel_type" "FuelType" NOT NULL,
    "emission_multiplier" DECIMAL NOT NULL,
    "npm" CHAR(12) NOT NULL,

    CONSTRAINT "StudentVehicle_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "VehicleActivity" (
    "activity_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "mileage" DECIMAL NOT NULL,
    "produced_emission" DECIMAL NOT NULL,
    "start_lat" DECIMAL(10,8) NOT NULL,
    "start_long" DECIMAL(11,8) NOT NULL,
    "end_lat" DECIMAL(10,8) NOT NULL,
    "end_long" DECIMAL(11,8) NOT NULL,
    "emission_category" "EmissionCategory" NOT NULL,
    "geofence_label" "GeofenceLabel" NOT NULL,

    CONSTRAINT "VehicleActivity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "Geofence" (
    "location_id" TEXT NOT NULL,
    "area_name" VARCHAR(255) NOT NULL,
    "polygon_vertices" JSONB NOT NULL,

    CONSTRAINT "Geofence_pkey" PRIMARY KEY ("location_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserStudent_user_id_key" ON "UserStudent"("user_id");

-- AddForeignKey
ALTER TABLE "UserStudent" ADD CONSTRAINT "UserStudent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentVehicle" ADD CONSTRAINT "StudentVehicle_npm_fkey" FOREIGN KEY ("npm") REFERENCES "UserStudent"("npm") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleActivity" ADD CONSTRAINT "VehicleActivity_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "StudentVehicle"("vehicle_id") ON DELETE CASCADE ON UPDATE CASCADE;
