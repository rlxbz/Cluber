<template>
  <div class="list-filter-bar">
    <el-input
      :model-value="keyword"
      :placeholder="placeholder"
      clearable
      class="filter-keyword"
      @update:model-value="handleKeywordChange"
      @clear="handleReset"
      @keyup.enter="handleSearch"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <el-select
      v-for="item in normalizedFilterItems"
      :key="item.key"
      :model-value="localFilters[item.key]"
      :placeholder="item.placeholder"
      clearable
      class="filter-select"
      @update:model-value="(value) => handleFilterChange(item.key, value)"
    >
      <el-option
        v-for="option in item.options"
        :key="`${item.key}-${option.value}`"
        :label="option.label"
        :value="option.value"
      />
    </el-select>

    <slot name="extra" />

    <el-button type="primary" @click="handleSearch">{{ actionText }}</el-button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";

const props = defineProps({
  keyword: {
    type: String,
    default: "",
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  filterItems: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "请输入关键词",
  },
  actionText: {
    type: String,
    default: "搜索",
  },
  searchOnChange: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:keyword", "update:filters", "search", "reset"]);

const localFilters = ref({ ...props.filters });

const normalizedFilterItems = computed(() =>
  props.filterItems.filter((item) => item?.key && Array.isArray(item.options) && item.options.length)
);

watch(
  () => props.filters,
  (value) => {
    localFilters.value = { ...(value || {}) };
  },
  { deep: true }
);

const handleKeywordChange = (value) => {
  emit("update:keyword", value);
};

const handleFilterChange = (key, value) => {
  const nextFilters = {
    ...localFilters.value,
    [key]: value,
  };
  localFilters.value = nextFilters;
  emit("update:filters", nextFilters);

  if (props.searchOnChange) {
    emit("search", {
      keyword: props.keyword,
      filters: nextFilters,
    });
  }
};

const handleSearch = () => {
  emit("search", {
    keyword: props.keyword,
    filters: localFilters.value,
  });
};

const handleReset = () => {
  const clearedFilters = Object.keys(localFilters.value).reduce((result, key) => {
    result[key] = "";
    return result;
  }, {});

  localFilters.value = clearedFilters;
  emit("update:keyword", "");
  emit("update:filters", clearedFilters);
  emit("reset", {
    keyword: "",
    filters: clearedFilters,
  });

  if (props.searchOnChange) {
    emit("search", {
      keyword: "",
      filters: clearedFilters,
    });
  }
};
</script>

<style scoped>
.list-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-keyword {
  width: 320px;
  max-width: 100%;
}

.filter-select {
  width: 180px;
}

@media (max-width: 768px) {
  .list-filter-bar {
    align-items: stretch;
  }

  .filter-keyword,
  .filter-select {
    width: 100%;
  }
}
</style>
