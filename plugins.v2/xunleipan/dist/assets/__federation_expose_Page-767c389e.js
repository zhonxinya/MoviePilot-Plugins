import { i as importShared, u as useToast } from './vendor-fec5d75f.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-c4c0bc37.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,normalizeClass:_normalizeClass,createElementVNode:_createElementVNode,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');

const _hoisted_1 = { class: "d-flex align-center" };
const _hoisted_2 = ["onClick"];
const {ref,computed,onMounted} = await importShared('vue');
const pluginId = "XunleiPan";
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Page",
  props: {
    api: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["action", "switch", "close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    console.log("[XunleiPan Page] ========== 组件加载 ==========");
    console.log("[XunleiPan Page] Props:", props);
    const toast = useToast();
    const loading = ref(false);
    const submitting = ref(false);
    const taskLoading = ref(false);
    const currentPath = ref("/");
    const fileList = ref([]);
    const taskList = ref([]);
    const showOfflineDownloadDialog = ref(false);
    const showTaskListDialog = ref(false);
    const downloadUrl = ref("");
    const savePath = ref("");
    const breadcrumbItems = computed(() => {
      const paths = currentPath.value.split("/").filter((p) => p);
      return paths.map((path, index) => ({
        title: path,
        href: `/${paths.slice(0, index + 1).join("/")}`
      }));
    });
    const headers = [
      { title: "文件名", key: "name", sortable: true },
      { title: "大小", key: "size", sortable: true },
      { title: "修改时间", key: "modified_time", sortable: true },
      { title: "操作", key: "actions", sortable: false }
    ];
    const taskHeaders = [
      { title: "任务名称", key: "name", sortable: true },
      { title: "状态", key: "status", sortable: true },
      { title: "进度", key: "progress", sortable: true },
      { title: "速度", key: "speed", sortable: false },
      { title: "操作", key: "actions", sortable: false }
    ];
    const apiCall = async (endpoint, method = "GET", data) => {
      try {
        let response;
        if (method === "GET") {
          response = await props.api.get(`plugin/${pluginId}${endpoint}`);
        } else if (method === "POST") {
          response = await props.api.post(`plugin/${pluginId}${endpoint}`, data);
        }
        return response;
      } catch (error) {
        toast.error(`API 调用失败: ${error.message}`);
        throw error;
      }
    };
    const loadFiles = async () => {
      loading.value = true;
      try {
        const result = await apiCall(`/files?parent_id=${encodeURIComponent(currentPath.value)}&page=1&limit=50`);
        if (result.code === 200) {
          fileList.value = result.data.files || [];
        } else {
          toast.error(result.message || "加载文件列表失败");
        }
      } catch (error) {
        console.error("加载文件列表失败:", error);
      } finally {
        loading.value = false;
      }
    };
    const refreshFiles = () => {
      loadFiles();
    };
    const navigateToFolder = (folder) => {
      currentPath.value = folder.path;
      loadFiles();
    };
    const navigateToRoot = () => {
      currentPath.value = "/";
      loadFiles();
    };
    const downloadFile = async (file) => {
      try {
        const result = await apiCall(`/download/${file.id}`, "POST");
        if (result.code === 200) {
          toast.success("开始下载");
        } else {
          toast.error(result.message || "下载失败");
        }
      } catch (error) {
        console.error("下载文件失败:", error);
      }
    };
    const deleteFile = async (file) => {
      if (!confirm(`确定要删除 "${file.name}" 吗?`)) {
        return;
      }
      try {
        const result = await apiCall(`/delete/${file.id}`, "POST");
        if (result.code === 200) {
          toast.success("删除成功");
          loadFiles();
        } else {
          toast.error(result.message || "删除失败");
        }
      } catch (error) {
        console.error("删除文件失败:", error);
      }
    };
    const submitOfflineDownload = async () => {
      if (!downloadUrl.value) {
        toast.error("请输入下载链接");
        return;
      }
      submitting.value = true;
      try {
        const result = await apiCall("/offline_download", "POST", {
          url: downloadUrl.value,
          save_path: savePath.value || currentPath.value
        });
        if (result.code === 200) {
          toast.success("离线下载任务已提交");
          showOfflineDownloadDialog.value = false;
          downloadUrl.value = "";
          savePath.value = "";
          showTaskListDialog.value = true;
          loadTasks();
        } else {
          toast.error(result.message || "提交失败");
        }
      } catch (error) {
        console.error("提交离线下载失败:", error);
      } finally {
        submitting.value = false;
      }
    };
    const loadTasks = async () => {
      taskLoading.value = true;
      try {
        const result = await apiCall("/tasks");
        if (result.code === 200) {
          taskList.value = result.data.tasks || [];
        } else {
          toast.error(result.message || "加载任务列表失败");
        }
      } catch (error) {
        console.error("加载任务列表失败:", error);
      } finally {
        taskLoading.value = false;
      }
    };
    const refreshTasks = () => {
      loadTasks();
    };
    const pauseTask = async (task) => {
      try {
        const result = await apiCall(`/task/${task.id}/pause`, "POST");
        if (result.code === 200) {
          toast.success("任务已暂停");
          loadTasks();
        } else {
          toast.error(result.message || "暂停失败");
        }
      } catch (error) {
        console.error("暂停任务失败:", error);
      }
    };
    const resumeTask = async (task) => {
      try {
        const result = await apiCall(`/task/${task.id}/resume`, "POST");
        if (result.code === 200) {
          toast.success("任务已恢复");
          loadTasks();
        } else {
          toast.error(result.message || "恢复失败");
        }
      } catch (error) {
        console.error("恢复任务失败:", error);
      }
    };
    const cancelTask = async (task) => {
      if (!confirm(`确定要取消任务 "${task.name}" 吗?`)) {
        return;
      }
      try {
        const result = await apiCall(`/task/${task.id}/cancel`, "POST");
        if (result.code === 200) {
          toast.success("任务已取消");
          loadTasks();
        } else {
          toast.error(result.message || "取消失败");
        }
      } catch (error) {
        console.error("取消任务失败:", error);
      }
    };
    const formatFileSize = (bytes) => {
      if (!bytes)
        return "-";
      const units = ["B", "KB", "MB", "GB", "TB"];
      let unitIndex = 0;
      let size = bytes;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };
    const formatDate = (timestamp) => {
      if (!timestamp)
        return "-";
      const date = new Date(timestamp * 1e3);
      return date.toLocaleString("zh-CN");
    };
    const getFileIcon = (filename) => {
      const ext = filename.split(".").pop()?.toLowerCase();
      const iconMap = {
        "mp4": "mdi-movie",
        "mkv": "mdi-movie",
        "avi": "mdi-movie",
        "mp3": "mdi-music",
        "flac": "mdi-music",
        "jpg": "mdi-image",
        "png": "mdi-image",
        "pdf": "mdi-file-pdf",
        "doc": "mdi-file-word",
        "docx": "mdi-file-word",
        "xls": "mdi-file-excel",
        "xlsx": "mdi-file-excel",
        "zip": "mdi-zip-box",
        "rar": "mdi-zip-box",
        "7z": "mdi-zip-box"
      };
      return iconMap[ext || ""] || "mdi-file";
    };
    const getTaskStatusColor = (status) => {
      const colorMap = {
        "downloading": "primary",
        "completed": "success",
        "failed": "error",
        "paused": "warning",
        "waiting": "grey"
      };
      return colorMap[status] || "grey";
    };
    const getTaskStatusText = (status) => {
      const textMap = {
        "downloading": "下载中",
        "completed": "已完成",
        "failed": "失败",
        "paused": "已暂停",
        "waiting": "等待中"
      };
      return textMap[status] || status;
    };
    onMounted(() => {
      loadFiles();
    });
    return (_ctx, _cache) => {
      const _component_v_icon = _resolveComponent("v-icon");
      const _component_v_spacer = _resolveComponent("v-spacer");
      const _component_v_btn = _resolveComponent("v-btn");
      const _component_v_card_title = _resolveComponent("v-card-title");
      const _component_v_card = _resolveComponent("v-card");
      const _component_v_col = _resolveComponent("v-col");
      const _component_v_row = _resolveComponent("v-row");
      const _component_v_breadcrumbs_item = _resolveComponent("v-breadcrumbs-item");
      const _component_v_breadcrumbs = _resolveComponent("v-breadcrumbs");
      const _component_v_data_table = _resolveComponent("v-data-table");
      const _component_v_card_text = _resolveComponent("v-card-text");
      const _component_v_text_field = _resolveComponent("v-text-field");
      const _component_v_form = _resolveComponent("v-form");
      const _component_v_card_actions = _resolveComponent("v-card-actions");
      const _component_v_dialog = _resolveComponent("v-dialog");
      const _component_v_chip = _resolveComponent("v-chip");
      const _component_v_progress_linear = _resolveComponent("v-progress-linear");
      const _component_v_container = _resolveComponent("v-container");
      return _openBlock(), _createBlock(_component_v_container, {
        fluid: "",
        class: "xunleipan-page"
      }, {
        default: _withCtx(() => [
          _createVNode(_component_v_row, { class: "mb-4" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_col, { cols: "12" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, {
                            color: "primary",
                            class: "mr-2"
                          }, {
                            default: _withCtx(() => [..._cache[7] || (_cache[7] = [
                              _createTextVNode("mdi-cloud-download", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[10] || (_cache[10] = _createTextVNode(" 迅雷网盘 - 文件管理 ", -1)),
                          _createVNode(_component_v_spacer),
                          _createVNode(_component_v_btn, {
                            color: "primary",
                            onClick: _cache[0] || (_cache[0] = ($event) => showOfflineDownloadDialog.value = true),
                            "prepend-icon": "mdi-plus"
                          }, {
                            default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                              _createTextVNode(" 添加离线下载 ", -1)
                            ])]),
                            _: 1
                          }),
                          _createVNode(_component_v_btn, {
                            color: "secondary",
                            onClick: refreshFiles,
                            loading: loading.value,
                            "prepend-icon": "mdi-refresh",
                            class: "ml-2"
                          }, {
                            default: _withCtx(() => [..._cache[9] || (_cache[9] = [
                              _createTextVNode(" 刷新 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["loading"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode(_component_v_row, { class: "mb-3" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_col, { cols: "12" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_breadcrumbs, {
                    items: breadcrumbItems.value,
                    divider: "/"
                  }, {
                    prepend: _withCtx(() => [
                      _createVNode(_component_v_breadcrumbs_item, { onClick: navigateToRoot }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, null, {
                            default: _withCtx(() => [..._cache[11] || (_cache[11] = [
                              _createTextVNode("mdi-home", -1)
                            ])]),
                            _: 1
                          }),
                          _cache[12] || (_cache[12] = _createTextVNode(" 根目录 ", -1))
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }, 8, ["items"])
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode(_component_v_row, null, {
            default: _withCtx(() => [
              _createVNode(_component_v_col, { cols: "12" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_text, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_data_table, {
                            headers,
                            items: fileList.value,
                            loading: loading.value,
                            "loading-text": "加载中...",
                            "no-data-text": "暂无文件",
                            hover: "",
                            density: "comfortable"
                          }, {
                            "item.name": _withCtx(({ item }) => [
                              _createElementVNode("div", _hoisted_1, [
                                _createVNode(_component_v_icon, {
                                  color: item.is_folder ? "amber" : "blue",
                                  class: "mr-2"
                                }, {
                                  default: _withCtx(() => [
                                    _createTextVNode(_toDisplayString(item.is_folder ? "mdi-folder" : getFileIcon(item.name)), 1)
                                  ]),
                                  _: 2
                                }, 1032, ["color"]),
                                _createElementVNode("span", {
                                  class: _normalizeClass({ "cursor-pointer": item.is_folder }),
                                  onClick: ($event) => item.is_folder && navigateToFolder(item)
                                }, _toDisplayString(item.name), 11, _hoisted_2)
                              ])
                            ]),
                            "item.size": _withCtx(({ item }) => [
                              _createTextVNode(_toDisplayString(formatFileSize(item.size)), 1)
                            ]),
                            "item.modified_time": _withCtx(({ item }) => [
                              _createTextVNode(_toDisplayString(formatDate(item.modified_time)), 1)
                            ]),
                            "item.actions": _withCtx(({ item }) => [
                              !item.is_folder ? (_openBlock(), _createBlock(_component_v_btn, {
                                key: 0,
                                size: "small",
                                color: "primary",
                                variant: "text",
                                onClick: ($event) => downloadFile(item),
                                "prepend-icon": "mdi-download"
                              }, {
                                default: _withCtx(() => [..._cache[13] || (_cache[13] = [
                                  _createTextVNode(" 下载 ", -1)
                                ])]),
                                _: 1
                              }, 8, ["onClick"])) : _createCommentVNode("", true),
                              _createVNode(_component_v_btn, {
                                size: "small",
                                color: "error",
                                variant: "text",
                                onClick: ($event) => deleteFile(item),
                                "prepend-icon": "mdi-delete"
                              }, {
                                default: _withCtx(() => [..._cache[14] || (_cache[14] = [
                                  _createTextVNode(" 删除 ", -1)
                                ])]),
                                _: 1
                              }, 8, ["onClick"])
                            ]),
                            _: 1
                          }, 8, ["items", "loading"])
                        ]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }),
          _createVNode(_component_v_dialog, {
            modelValue: showOfflineDownloadDialog.value,
            "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => showOfflineDownloadDialog.value = $event),
            "max-width": "600"
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[15] || (_cache[15] = [
                          _createTextVNode("mdi-link-plus", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[16] || (_cache[16] = _createTextVNode(" 添加离线下载任务 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_form, { ref: "downloadForm" }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_text_field, {
                            modelValue: downloadUrl.value,
                            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => downloadUrl.value = $event),
                            label: "下载链接",
                            placeholder: "支持 HTTP、HTTPS、FTP、磁力链接等",
                            required: "",
                            rules: "[v => !!v || '请输入下载链接']"
                          }, null, 8, ["modelValue"]),
                          _createVNode(_component_v_text_field, {
                            modelValue: savePath.value,
                            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => savePath.value = $event),
                            label: "保存路径(可选)",
                            placeholder: "留空则保存到当前目录"
                          }, null, 8, ["modelValue"])
                        ]),
                        _: 1
                      }, 512)
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_actions, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        color: "grey",
                        variant: "text",
                        onClick: _cache[3] || (_cache[3] = ($event) => showOfflineDownloadDialog.value = false)
                      }, {
                        default: _withCtx(() => [..._cache[17] || (_cache[17] = [
                          _createTextVNode(" 取消 ", -1)
                        ])]),
                        _: 1
                      }),
                      _createVNode(_component_v_btn, {
                        color: "primary",
                        onClick: submitOfflineDownload,
                        loading: submitting.value
                      }, {
                        default: _withCtx(() => [..._cache[18] || (_cache[18] = [
                          _createTextVNode(" 提交 ", -1)
                        ])]),
                        _: 1
                      }, 8, ["loading"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"]),
          _createVNode(_component_v_dialog, {
            modelValue: showTaskListDialog.value,
            "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => showTaskListDialog.value = $event),
            "max-width": "800"
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, {
                        color: "primary",
                        class: "mr-2"
                      }, {
                        default: _withCtx(() => [..._cache[19] || (_cache[19] = [
                          _createTextVNode("mdi-format-list-bulleted", -1)
                        ])]),
                        _: 1
                      }),
                      _cache[21] || (_cache[21] = _createTextVNode(" 离线下载任务列表 ", -1)),
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        size: "small",
                        color: "secondary",
                        onClick: refreshTasks,
                        "prepend-icon": "mdi-refresh"
                      }, {
                        default: _withCtx(() => [..._cache[20] || (_cache[20] = [
                          _createTextVNode(" 刷新 ", -1)
                        ])]),
                        _: 1
                      })
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_text, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_data_table, {
                        headers: taskHeaders,
                        items: taskList.value,
                        loading: taskLoading.value,
                        "loading-text": "加载中...",
                        "no-data-text": "暂无任务",
                        hover: "",
                        density: "comfortable"
                      }, {
                        "item.status": _withCtx(({ item }) => [
                          _createVNode(_component_v_chip, {
                            color: getTaskStatusColor(item.status),
                            size: "small"
                          }, {
                            default: _withCtx(() => [
                              _createTextVNode(_toDisplayString(getTaskStatusText(item.status)), 1)
                            ]),
                            _: 2
                          }, 1032, ["color"])
                        ]),
                        "item.progress": _withCtx(({ item }) => [
                          _createVNode(_component_v_progress_linear, {
                            "model-value": item.progress,
                            height: "20",
                            striped: ""
                          }, {
                            default: _withCtx(() => [
                              _createElementVNode("strong", null, _toDisplayString(Math.round(item.progress)) + "%", 1)
                            ]),
                            _: 2
                          }, 1032, ["model-value"])
                        ]),
                        "item.actions": _withCtx(({ item }) => [
                          item.status === "downloading" ? (_openBlock(), _createBlock(_component_v_btn, {
                            key: 0,
                            size: "small",
                            color: "warning",
                            variant: "text",
                            onClick: ($event) => pauseTask(item),
                            "prepend-icon": "mdi-pause"
                          }, {
                            default: _withCtx(() => [..._cache[22] || (_cache[22] = [
                              _createTextVNode(" 暂停 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])) : _createCommentVNode("", true),
                          item.status === "paused" ? (_openBlock(), _createBlock(_component_v_btn, {
                            key: 1,
                            size: "small",
                            color: "success",
                            variant: "text",
                            onClick: ($event) => resumeTask(item),
                            "prepend-icon": "mdi-play"
                          }, {
                            default: _withCtx(() => [..._cache[23] || (_cache[23] = [
                              _createTextVNode(" 继续 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])) : _createCommentVNode("", true),
                          _createVNode(_component_v_btn, {
                            size: "small",
                            color: "error",
                            variant: "text",
                            onClick: ($event) => cancelTask(item),
                            "prepend-icon": "mdi-cancel"
                          }, {
                            default: _withCtx(() => [..._cache[24] || (_cache[24] = [
                              _createTextVNode(" 取消 ", -1)
                            ])]),
                            _: 1
                          }, 8, ["onClick"])
                        ]),
                        _: 1
                      }, 8, ["items", "loading"])
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_actions, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_btn, {
                        color: "primary",
                        onClick: _cache[5] || (_cache[5] = ($event) => showTaskListDialog.value = false)
                      }, {
                        default: _withCtx(() => [..._cache[25] || (_cache[25] = [
                          _createTextVNode(" 关闭 ", -1)
                        ])]),
                        _: 1
                      })
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        _: 1
      });
    };
  }
});

const Page_vue_vue_type_style_index_0_scoped_003202f5_lang = '';

const Page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-003202f5"]]);

export { Page as default };
