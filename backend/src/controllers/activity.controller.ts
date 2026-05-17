import type { NextFunction, Request, Response } from "express";
import * as activityService from "../services/activity.service.js";
import AppError from "../errors/appError.js";
import { serializeBigInt } from "../helpers/serialize.helper.js";
import {
  createActivitySchema,
  updateActivitySchema,
} from "../schemas/activity.schema.js";

export async function createActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = createActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const activity = await activityService.createActivity(parsed.data);
    return res.status(201).json(serializeBigInt(activity));
  } catch (error) {
    next(error);
  }
}

export async function getActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const activity = await activityService.getActivityById(id);
    return res.status(200).json(serializeBigInt(activity));
  } catch (error) {
    next(error);
  }
}

export async function getAllActivities(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const activities = await activityService.getAllActivities();
    return res.status(200).json(serializeBigInt(activities));
  } catch (error) {
    next(error);
  }
}

export async function getActivitiesByBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const businessId = Number(req.query.businessId);
    if (isNaN(businessId)) {
      throw new AppError("businessId inválido", 400);
    }

    const activities = await activityService.getActivitiesByBusinessId(businessId);
    return res.status(200).json(serializeBigInt(activities));
  } catch (error) {
    next(error);
  }
}

export async function updateActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    const parsed = updateActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message ?? "Validation error", 400);
    }

    const activity = await activityService.updateActivity(id, parsed.data);
    return res.status(200).json(serializeBigInt(activity));
  } catch (error) {
    next(error);
  }
}

export async function deleteActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new AppError("ID inválido", 400);
    }

    await activityService.deleteActivity(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}