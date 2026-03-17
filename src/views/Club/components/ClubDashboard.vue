<template>
  <div class="club-overview-wrapper">
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="16" class="mb-20">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>本社团活动趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart-box"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8" class="mb-20">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>成员年级分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import * as echarts from "echarts";

const lineChartRef = ref(null);
const pieChartRef = ref(null);
let lineChartInstance = null;
let pieChartInstance = null;

const initCharts = () => {
  if (!lineChartRef.value || !pieChartRef.value) {
    return;
  }

  lineChartInstance = echarts.init(lineChartRef.value);
  lineChartInstance.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["1月", "2月", "3月", "4月", "5月", "6月"],
      axisLine: { lineStyle: { color: "#909399" } },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { type: "dashed", color: "#E4E7ED" } },
    },
    series: [
      {
        name: "活动热度",
        type: "line",
        smooth: true,
        showSymbol: false,
        itemStyle: { color: "#409EFF" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(64,158,255,0.4)" },
            { offset: 1, color: "rgba(64,158,255,0.01)" },
          ]),
        },
        data: [120, 132, 101, 134, 290, 230],
      },
    ],
  });

  pieChartInstance = echarts.init(pieChartRef.value);
  pieChartInstance.setOption({
    tooltip: { trigger: "item" },
    legend: { bottom: "0%", icon: "circle" },
    series: [
      {
        name: "年级分布",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        data: [
          { value: 450, name: "大一", itemStyle: { color: "#409EFF" } },
          { value: 380, name: "大二", itemStyle: { color: "#67C23A" } },
          { value: 200, name: "大三", itemStyle: { color: "#E6A23C" } },
          { value: 174, name: "大四", itemStyle: { color: "#F56C6C" } },
        ],
      },
    ],
  });
};

const handleResize = () => {
  lineChartInstance?.resize();
  pieChartInstance?.resize();
};

onMounted(() => {
  nextTick(() => {
    initCharts();
    window.addEventListener("resize", handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  lineChartInstance?.dispose();
  pieChartInstance?.dispose();
});
</script>

<style scoped>
.chart-row {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.chart-box {
  height: 350px;
  width: 100%;
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}
</style>
