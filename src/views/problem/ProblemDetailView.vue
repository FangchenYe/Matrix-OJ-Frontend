<template>
  <div id="problemDescriptionView">
    <!--    todo: 把左边的题目详情改成可以单独滚动的样式-->
    <a-row :gutter="[24, 24]">
      <a-col :md="12" :xs="24">
        <a-card>
          <a-tabs
            default-active-key="description"
            size="mini"
            @tab-click="tabClick"
          >
            <a-tab-pane key="description">
              <template #title>
                <icon-bookmark style="color: dodgerblue" /> Description
              </template>
              <a-card v-if="problem">
                <h1>{{ problem.id }}. {{ problem.title }}</h1>
                <a-space>
                  <a-tag
                    v-if="problem"
                    :color="
                      problem.difficulty === 0
                        ? 'green'
                        : problem.difficulty === 1
                        ? 'orange'
                        : problem.difficulty === 2
                        ? 'red'
                        : 'grey'
                    "
                  >
                    {{
                      problem.difficulty === 0
                        ? "Easy"
                        : problem.difficulty === 1
                        ? "Medium"
                        : problem.difficulty === 2
                        ? "Hard"
                        : "Unknown"
                    }}
                  </a-tag>
                  <a-tag v-for="tag in problem.tags" :key="tag" color="blue">
                    {{ tag }}
                  </a-tag>
                </a-space>
                <MdViewer :value="problem.content || ''" />
              </a-card>
            </a-tab-pane>
            <a-tab-pane key="solution">
              <template #title>
                <icon-bg-colors style="color: dodgerblue" /> Solution
              </template>
              "No solution yet."
            </a-tab-pane>
            <a-tab-pane key="submission" @tab-click="tabClick">
              <template #title>
                <icon-record style="color: dodgerblue" /> Submission
              </template>
              <a-table
                :columns="submissionColumns"
                :data="submissionDataList"
                :pagination="{
                  pageSize: submissionSearchParams.pageSize,
                  current: submissionSearchParams.current,
                  showTotal: true,
                  showJumper: true,
                  total,
                }"
                @page-change="onSubmissionPageChange"
              >
                <template #result="{ record }">
                  <a-space>
                    <a-link
                      v-if="record.result === 'Accepted'"
                      style="color: limegreen"
                    >
                      {{ record.result }}
                    </a-link>
                    <a-link v-else style="color: red">{{
                      record.result
                    }}</a-link>
                  </a-space>
                </template>
                <template #language="{ record }">
                  <a-space>
                    <a-tag>{{ record.language }}</a-tag>
                  </a-space>
                </template>
                <template #time="{ record }">
                  <a-space>
                    <a-tag v-if="record.time !== null">
                      {{ record.time }} ms
                    </a-tag>
                    <a-tag v-else>N/A</a-tag>
                  </a-space>
                </template>
                <template #memory="{ record }">
                  <a-space>
                    <a-tag v-if="record.memory !== null">
                      {{ formatMemory(record.memory) }} MB
                    </a-tag>
                    <a-tag v-else>N/A</a-tag>
                  </a-space>
                </template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="test case">
              <template #title>
                <icon-check-square style="color: limegreen" /> Test Case
              </template>
              "No test case yet.
            </a-tab-pane>
            <a-tab-pane key="test result">
              <template #title>
                <icon-right style="color: limegreen" /> Test Result
              </template>
              "No test result yet."
            </a-tab-pane>
            <a-tab-pane key="discussion">
              <template #title>
                <icon-message style="color: limegreen" /> Discussion
              </template>
              "No discussion yet."
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
      <a-col :md="12" :xs="24">
        <a-card>
          <a-dropdown @select="selectLanguage">
            <a-button style="margin-right: 1px; margin-bottom: 2px">
              <IconCode style="color: limegreen" /> &nbsp;
              {{ form.language }} &nbsp;
              <icon-down />
            </a-button>
            <template #content>
              <a-doption>cpp</a-doption>
              <a-doption>python</a-doption>
              <a-doption>java</a-doption>
            </template>
          </a-dropdown>
          <a-button
            style="margin-right: 1px; margin-bottom: 2px"
            @click="doRun"
          >
            <IconCaretRight /> &nbsp; Run
          </a-button>
          <a-button
            style="color: limegreen; margin-bottom: 2px"
            @click="doSubmit"
          >
            <icon-upload /> &nbsp; Submit
          </a-button>
          <!--          todo: 增加自定义编辑器设置的功能-->
          <code-editor
            :value="form.code as string"
            :language="form.language as string"
            :handle-change="changeCode"
            :handle-language-change="selectLanguage"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, withDefaults } from "vue";
import {
  ProblemControllerService,
  ProblemSubmitAddRequest,
  ProblemSubmitControllerService,
  ProblemSubmitVO,
  ProblemVO,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import {
  IconBgColors,
  IconBookmark,
  IconCaretRight,
  IconCheckSquare,
  IconCode,
  IconDown,
  IconMessage,
  IconRecord,
  IconRight,
  IconUpload,
} from "@arco-design/web-vue/es/icon";
import { useStore } from "vuex";

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

const problem = ref<ProblemVO>();
// 获取用户id
const store = useStore();
const { user } = store.state;
const { loginUser } = user;
const userId = loginUser?.id;

const loadData = async () => {
  // console.log(userId);
  const res = await ProblemControllerService.getProblemVoByIdUsingGet(
    props.id as unknown as number
  );
  if (res.code === 0) {
    problem.value = res.data;
  } else {
    message.error("Failed to load data. " + res.message);
  }
};

const form = ref<ProblemSubmitAddRequest>({
  problemId: props.id as unknown as number,
  language: localStorage.getItem("language" + userId + props.id) || "cpp",
  code:
    localStorage.getItem(
      "code" +
        userId +
        props.id +
        (localStorage.getItem("language" + userId + props.id) || "cpp")
    ) || "",
});

// todo: 目前来说，语言和代码都是存储在localStorage中的，后面我认为应该优先获取用户的提交记录，
//  然后显示上次提交的代码和语言；如果未提交过，则显示默认的代码和语言，但是如果用户改变了代码和语言但是未提交，那么应该保存用户的选择。
// 可以这么做：在用户选择语言和修改代码的时候，就保存到localStorage中，然后在用户提交的时候，再保存到后端，并且在用户提交成功后，清空localStorage中的数据。
const selectLanguage = (e: unknown) => {
  form.value.language = e as string;
  if (typeof e === "string") {
    localStorage.setItem("language" + userId + form.value.problemId, e);
  }
};

onMounted(() => {
  loadData();
});

const doRun = () => {
  console.log("Run");
};

const changeCode = (v: string) => {
  form.value.code = v;
  localStorage.setItem(
    "code" + userId + form.value.problemId + form.value.language,
    v
  );
};

const doSubmit = async () => {
  message.loading({
    content: "Submitting...",
    duration: 1000,
  });
  const res = await ProblemSubmitControllerService.doProblemSubmitUsingPost(
    form.value
  );
  if (res.code === 0) {
    await loadSubmissionData();
    message.success({
      content: "Submitted successfully.",
      duration: 1000,
    });
  } else {
    message.error("Failed to submit. " + res.message);
  }
};

const submissionColumns = [
  {
    title: "Date",
    dataIndex: "createTime",
  },
  {
    title: "Result",
    dataIndex: "result",
    slotName: "result",
  },
  {
    title: "Language",
    dataIndex: "language",
    key: "language",
    slotName: "language",
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
    slotName: "time",
  },
  {
    title: "Memory",
    dataIndex: "memory",
    key: "memory",
    slotName: "memory",
  },
];

const submissionDataList = ref([]);

const submissionSearchParams = ref({
  pageSize: 10,
  current: 1,
  problemId: props.id as unknown as number,
});

const total = ref(0);

const loadSubmissionData = async () => {
  const res =
    await ProblemSubmitControllerService.listProblemSubmitByPageUsingPost(
      submissionSearchParams.value
    );
  if (res.code === 0) {
    submissionDataList.value = res.data.records.map(
      (problemSubmit: ProblemSubmitVO, index: number) => {
        const { judgeResult, ...restProblemSubmit } = problemSubmit;
        return {
          ...restProblemSubmit,
          ...judgeResult,
          index: index + 1, // 从1开始的序号
        };
      }
    );
    submissionDataList.value.forEach((record: ProblemSubmitVO) => {
      record.createTime = record.createTime?.substring(0, 10);
    });
    total.value = res.data.total;
  } else {
    message.error("Failed to load submission data. " + res.message);
  }
};

const tabClick = (key: string | number) => {
  if (key === "submission") {
    loadSubmissionData();
  }
};

// todo: 详细的提交记录，包括测试用例的结果，以及测试结果的详细信息
const checkResult = (record: ProblemSubmitVO) => {
  console.log(record);
  return "test";
};

const onSubmissionPageChange = async (page: number) => {
  submissionSearchParams.value = {
    ...submissionSearchParams.value,
    current: page,
  };
  await loadSubmissionData();
};

const formatMemory = (memory: number) => {
  return (memory / 1024 / 1024).toFixed(2);
};
</script>

<style scoped></style>
