<template>
  <section class="club-overview">
    <div class="overview-header">
      <div>
        <h3 class="overview-title">社团概览</h3>
        <p class="overview-desc">快速了解这个社团的日常氛围、活动节奏和加入方式。</p>
      </div>
    </div>

    <div class="overview-grid">
      <article v-for="item in overviewItems" :key="item.label" class="overview-card">
        <span class="overview-card__label">{{ item.label }}</span>
        <strong class="overview-card__value">{{ item.value }}</strong>
        <p class="overview-card__desc">{{ item.description }}</p>
      </article>
    </div>

    <div class="overview-notes">
      <article class="overview-note">
        <h4>加入前可以先看看</h4>
        <p>{{ joinTip }}</p>
      </article>
      <article class="overview-note">
        <h4>活动参与节奏</h4>
        <p>{{ activityTip }}</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useClubStore } from "@/stores/clubStore";

const clubStore = useClubStore();

const currentClub = computed(() => clubStore.currentClub || {});

const overviewItems = computed(() => [
  {
    label: "成员规模",
    value: `${currentClub.value.memberCount || 0} 人`,
    description: "社团当前登记成员数量。",
  },
  {
    label: "活动数量",
    value: `${currentClub.value.activityCount || 0} 场`,
    description: "公开可见的活动累计数量。",
  },
  {
    label: "社团类别",
    value: currentClub.value.category || currentClub.value.type || "待补充",
    description: "方便你快速判断是否符合兴趣方向。",
  },
]);

const joinTip = computed(
  () =>
    currentClub.value.description ||
    "先浏览社团简介、近期活动和负责人信息，再决定是否提交入社申请。"
);

const activityTip = computed(() => {
  const activityCount = Number(currentClub.value.activityCount || 0);

  if (activityCount > 0) {
    return `目前可见活动约 ${activityCount} 场，进入下方活动列表即可继续了解详细安排。`;
  }

  return "当前还没有公开活动，之后可以再来看看最新动态。";
});
</script>

<style scoped>
.club-overview {
  margin-top: 24px;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
  border: 1px solid rgba(64, 158, 255, 0.08);
}

.overview-header {
  margin-bottom: 16px;
}

.overview-title {
  margin: 0 0 6px;
  font-size: 18px;
}

.overview-desc {
  margin: 0;
  color: var(--text-light-color);
  line-height: 1.6;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.overview-card {
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--border-color);
}

.overview-card__label {
  display: block;
  font-size: 13px;
  color: var(--text-light-color);
}

.overview-card__value {
  display: block;
  margin: 8px 0;
  font-size: 24px;
  color: var(--text-color);
}

.overview-card__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-light-color);
}

.overview-notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.overview-note {
  padding: 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px dashed var(--border-color);
}

.overview-note h4 {
  margin: 0 0 8px;
  font-size: 15px;
}

.overview-note p {
  margin: 0;
  color: var(--text-light-color);
  line-height: 1.7;
}
</style>
