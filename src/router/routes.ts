import { RouteRecordRaw } from "vue-router";
import NoAuthView from "@/views/NoAuthView.vue";
import ROLE_ENUM from "@/access/roleEnum";
import UserLayout from "@/layouts/UserLayout.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import AddProblemView from "@/views/problem/AddProblemView.vue";
import ManageProblemView from "@/views/problem/ManageProblemView.vue";
import ProblemView from "@/views/problem/ProblemView.vue";
import AboutView from "@/views/AboutView.vue";
import ProblemDetailView from "@/views/problem/ProblemDetailView.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/user",
    name: "User",
    component: UserLayout,
    meta: {
      hideInMenu: true,
      access: ROLE_ENUM.USER,
    },
    children: [
      {
        path: "/user/login",
        name: "Login",
        component: UserLoginView,
        meta: {
          access: ROLE_ENUM.NOT_LOGIN,
        },
      },
      {
        path: "/user/register",
        name: "Register",
        component: UserRegisterView,
        meta: {
          access: ROLE_ENUM.NOT_LOGIN,
        },
      },
    ],
  },
  {
    path: "/",
    name: "Home",
    component: AboutView,
    meta: {
      hideInMenu: true,
      access: ROLE_ENUM.NOT_LOGIN,
    },
  },
  {
    path: "/problems",
    name: "Problems",
    component: ProblemView,
    meta: {
      access: ROLE_ENUM.NOT_LOGIN,
    },
    // children: [
    //   {
    //     path: "/description/:id",
    //     name: "Problem Description",
    //     component: ProblemDescriptionView,
    //     props: true,
    //     meta: {
    //       access: ROLE_ENUM.USER,
    //     },
    //   },
    // ],
  },
  //todo 问题描述页面，应该是位于问题页面的子页面，但是这样会导致权限控制失效，暂时先这样
  {
    path: "/problems/:id",
    name: "Problem Description",
    component: ProblemDetailView,
    props: true,
    meta: {
      hideInMenu: true,
      access: ROLE_ENUM.USER,
    },
  },
  {
    path: "/no-auth",
    name: "NoAuth",
    component: NoAuthView,
    meta: {
      hideInMenu: true,
      meta: {
        access: ROLE_ENUM.USER,
      },
    },
  },
  {
    path: "/add/problem",
    name: "Add Problem",
    component: AddProblemView,
    meta: {
      access: ROLE_ENUM.ADMIN,
    },
  },
  {
    path: "/update/problem",
    name: "Update Problem",
    component: AddProblemView,
    meta: {
      hideInMenu: true,
      access: ROLE_ENUM.ADMIN,
    },
  },
  {
    path: "/manage/problem",
    name: "Manage Problem",
    component: ManageProblemView,
    meta: {
      access: ROLE_ENUM.ADMIN,
    },
  },
];
