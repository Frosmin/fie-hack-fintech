import * as activityRepository from "../repositories/activity.repository.js";
import AppError from "../errors/appError.js";

interface CreateActivityInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
  businessId: number;
}

interface UpdateActivityInput {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
}

export async function createActivity(data: CreateActivityInput) {
  return activityRepository.create(data);
}

export async function getActivityById(id: bigint | number) {
  const activity = await activityRepository.findById(id);
  if (!activity) {
    throw new AppError("Actividad no encontrada", 404);
  }
  return activity;
}

export async function getAllActivities() {
  return activityRepository.findAll();
}

export async function getActivitiesByBusinessId(businessId: number) {
  return activityRepository.findByBusinessId(businessId);
}

export async function updateActivity(
  id: bigint | number,
  data: UpdateActivityInput,
) {
  const activity = await activityRepository.findById(id);
  if (!activity) {
    throw new AppError("Actividad no encontrada", 404);
  }
  return activityRepository.update(id, data);
}

export async function deleteActivity(id: bigint | number) {
  const activity = await activityRepository.findById(id);
  if (!activity) {
    throw new AppError("Actividad no encontrada", 404);
  }
  await activityRepository.deleteById(id);
  return { deleted: true };
}