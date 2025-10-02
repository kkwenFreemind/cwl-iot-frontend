<template>
  <router-view v-slot="{ Component, route }">
    <transition enter-active-class="animate__animated animate__fadeIn" mode="out-in" appear>
      <keep-alive :include="tagsViewStore.cachedViews">
        <component :is="Component" v-if="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>
<script setup lang="ts">
defineOptions({ name: "KeepCache" });

import { useTagsViewStore } from "@/store";

const tagsViewStore = useTagsViewStore();
</script>
