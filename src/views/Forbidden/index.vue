<template>
  <ForbiddenState :home-text="homeText" @go-home="goHome" @go-back="goBack" />
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ForbiddenState from "@/components/business/ForbiddenState.vue";
import { useUserStore } from "@/stores/userStore";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const homeText = computed(() => (userStore.isLogin ? "返回默认页" : "返回首页"));

const goHome = () => {
  router.replace(userStore.isLogin ? userStore.defaultFrontRoute : "/home");
};

const goBack = () => {
  const redirect = Array.isArray(route.query.redirect)
    ? route.query.redirect[0]
    : route.query.redirect;

  if (typeof redirect === "string" && redirect.startsWith("/") && redirect !== "/403") {
    router.replace(redirect);
    return;
  }

  router.back();
};
</script>
