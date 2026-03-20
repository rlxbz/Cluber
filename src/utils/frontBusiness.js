import dayjs from "dayjs";

export const normalizeId = (value) => {
  if (value === 0 || value === "0") {
    return "0";
  }

  return String(value ?? "").trim();
};

export const getErrorMessage = (error, fallback = "加载失败，请稍后重试") =>
  error?.response?.data?.message || error?.message || fallback;

export const formatActivityTime = (value) => {
  if (!value) {
    return "时间待定";
  }

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm") : value;
};

export const getActivitySummaryText = (activity = {}) =>
  activity.intro ||
  activity.brief ||
  activity.description ||
  activity.content ||
  "活动详情待更新";

export const getActivityHostName = (activity = {}) =>
  activity.clubName || activity.organizer || "主办方待更新";

export const getActivityParticipantInfo = (activity = {}) => {
  const currentValue = Number(
    activity.currentParticipants ?? activity.signUpCount ?? activity.participantCount ?? 0
  );
  const maxValue = Number(activity.maxParticipants ?? activity.limitCount ?? 0);
  const current = Number.isFinite(currentValue) ? currentValue : 0;
  const max = Number.isFinite(maxValue) ? maxValue : 0;

  return {
    current,
    max,
    text: max > 0 ? `${current}/${max}` : `已有${current}人报名`,
  };
};

export const getActivitySignupStatusMeta = (activity = {}) => {
  const participantInfo = getActivityParticipantInfo(activity);
  const signUpEndTime =
    activity.signUpEndTime || activity.deadline || activity.registrationEndTime || "";
  const activityStatus = String(activity.status || "").toLowerCase();
  const hasEnded = activityStatus === "ended";
  const isClosedByTime = signUpEndTime ? dayjs().isAfter(dayjs(signUpEndTime)) : false;
  const isFull = participantInfo.max > 0 && participantInfo.current >= participantInfo.max;
  const isSigned = Boolean(activity.isSigned);
  const isDisabled =
    activity.canSignUp === false ||
    activity.signUpDisabled === true ||
    activity.disabled === true ||
    hasEnded;

  if (isSigned) {
    return {
      key: "signed",
      text: "已报名",
      type: "success",
    };
  }

  if (isClosedByTime) {
    return {
      key: "closed",
      text: "报名已截止",
      type: "info",
    };
  }

  if (isFull) {
    return {
      key: "full",
      text: "名额已满",
      type: "warning",
    };
  }

  if (isDisabled) {
    return {
      key: "disabled",
      text: "暂不可报名",
      type: "info",
    };
  }

  return {
    key: "available",
    text: "可报名",
    type: "primary",
  };
};

export const formatApplyStatus = (status) => {
  const statusMap = {
    pending: "审核中",
    approved: "已通过",
    rejected: "已拒绝",
    canceled: "已取消",
    cancelled: "已取消",
  };

  return statusMap[String(status || "").toLowerCase()] || "状态待更新";
};

export const getApplyStatusMeta = (status) => {
  const statusKey = String(status || "").toLowerCase();
  const statusMap = {
    pending: {
      text: "审核中",
      type: "warning",
    },
    approved: {
      text: "已通过",
      type: "success",
    },
    rejected: {
      text: "已拒绝",
      type: "danger",
    },
    canceled: {
      text: "已取消",
      type: "info",
    },
    cancelled: {
      text: "已取消",
      type: "info",
    },
  };

  return statusMap[statusKey] || { text: "状态待更新", type: "info" };
};

export const formatApplyType = (type) => {
  const typeMap = {
    join: "入社申请",
    join_club: "入社申请",
    create: "创建社团",
    create_club: "创建社团",
    activity: "活动发布",
  };

  return typeMap[String(type || "").toLowerCase()] || "其他申请";
};

export const getApplyTypeTagType = (type) => {
  const typeMap = {
    join: "info",
    join_club: "info",
    create: "primary",
    create_club: "primary",
    activity: "success",
  };

  return typeMap[String(type || "").toLowerCase()] || "info";
};

export const isPendingClubJoinApply = (apply, clubId) => {
  const normalizedClubId = normalizeId(clubId);
  const applyType = String(apply?.type || "").toLowerCase();
  const applyStatus = String(apply?.status || "").toLowerCase();
  const targetClubId = normalizeId(apply?.clubId ?? apply?.targetId ?? "");

  return (
    normalizedClubId &&
    ["join", "join_club"].includes(applyType) &&
    targetClubId === normalizedClubId &&
    applyStatus === "pending"
  );
};
