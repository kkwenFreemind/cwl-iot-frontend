<template>
  <div class="app-container">
    <!-- 搜尋區域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item :label="$t('menu.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('menu.menuNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" icon="plus" @click="handleOpenDialog('0')">
            {{ $t("common.add") }}
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        row-key="id"
        :data="menuTableData"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        class="data-table__content"
        @row-click="handleRowClick"
      >
        <el-table-column :label="$t('menu.menuName')" min-width="200">
          <template #default="scope">
            <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
              <el-icon style="vertical-align: -0.15em">
                <component :is="scope.row.icon.replace('el-icon-', '')" />
              </el-icon>
            </template>
            <template v-else-if="scope.row.icon">
              <div :class="`i-svg:${scope.row.icon}`" />
            </template>
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column :label="$t('menu.menuType')" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.type === MenuTypeEnum.CATALOG" type="warning">
              {{ $t("menu.menuTypes.directory") }}
            </el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.MENU" type="success">
              {{ $t("menu.menuTypes.menu") }}
            </el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.BUTTON" type="danger">
              {{ $t("menu.menuTypes.button") }}
            </el-tag>
            <el-tag v-if="scope.row.type === MenuTypeEnum.EXTLINK" type="info">
              {{ $t("menu.menuTypes.extlink") }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="路由名稱" align="left" width="150" prop="routeName" />
        <el-table-column :label="$t('menu.path')" align="left" width="150" prop="routePath" />
        <el-table-column :label="$t('menu.component')" align="left" width="250" prop="component" />
        <el-table-column :label="$t('menu.perms')" align="center" width="200" prop="perm" />
        <el-table-column :label="$t('menu.visible')" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">
              {{ $t("menu.visibleStatus.show") }}
            </el-tag>
            <el-tag v-else type="info">{{ $t("menu.visibleStatus.hide") }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('menu.sort')" align="center" width="80" prop="sort" />
        <el-table-column fixed="right" align="center" :label="$t('common.operation')" width="220">
          <template #default="scope">
            <el-button
              v-if="scope.row.type == MenuTypeEnum.CATALOG || scope.row.type == MenuTypeEnum.MENU"
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)"
            >
              {{ $t("common.add") }}
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              {{ $t("common.edit") }}
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              {{ $t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="$t('menu.form.parentId')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :placeholder="$t('menu.form.parentPlaceholder')"
            :data="menuOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item :label="$t('menu.form.name')" prop="name">
          <el-input v-model="formData.name" :placeholder="$t('menu.form.namePlaceholder')" />
        </el-form-item>

        <el-form-item :label="$t('menu.form.menuType')" prop="type">
          <el-radio-group v-model="formData.type" @change="handleMenuTypeChange">
            <el-radio :value="MenuTypeEnum.CATALOG">{{ $t("menu.menuTypes.directory") }}</el-radio>
            <el-radio :value="MenuTypeEnum.MENU">{{ $t("menu.menuTypes.menu") }}</el-radio>
            <el-radio :value="MenuTypeEnum.BUTTON">{{ $t("menu.menuTypes.button") }}</el-radio>
            <el-radio :value="MenuTypeEnum.EXTLINK">{{ $t("menu.menuTypes.extlink") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.EXTLINK"
          :label="$t('menu.form.extLinkPath')"
          prop="path"
        >
          <el-input
            v-model="formData.routePath"
            :placeholder="$t('menu.form.extLinkPlaceholder')"
          />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU" prop="routeName">
          <template #label>
            <div class="flex-y-center">
              {{ $t("menu.form.routeName") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ $t("menu.form.routeNameTooltip") }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="formData.routeName"
            :placeholder="$t('menu.form.routeNamePlaceholder')"
          />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG || formData.type == MenuTypeEnum.MENU"
          prop="routePath"
        >
          <template #label>
            <div class="flex-y-center">
              {{ $t("menu.form.routePath") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ $t("menu.form.routePathTooltip") }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-if="formData.type == MenuTypeEnum.CATALOG"
            v-model="formData.routePath"
            :placeholder="$t('menu.form.directoryPlaceholder')"
          />
          <el-input
            v-else
            v-model="formData.routePath"
            :placeholder="$t('menu.form.menuPlaceholder')"
          />
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU" prop="component">
          <template #label>
            <div class="flex-y-center">
              {{ $t("menu.form.component") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ $t("menu.form.componentTooltip") }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-input
            v-model="formData.component"
            :placeholder="$t('menu.form.componentPlaceholder')"
            style="width: 95%"
          >
            <template v-if="formData.type == MenuTypeEnum.MENU" #prepend>src/views/</template>
            <template v-if="formData.type == MenuTypeEnum.MENU" #append>.vue</template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.type == MenuTypeEnum.MENU">
          <template #label>
            <div class="flex-y-center">
              {{ $t("menu.form.routeParams") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ $t("menu.form.routeParamsTooltip") }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <div v-if="!formData.params || formData.params.length === 0">
            <el-button type="success" plain @click="formData.params = [{ key: '', value: '' }]">
              {{ $t("menu.form.addRouteParam") }}
            </el-button>
          </div>

          <div v-else>
            <div v-for="(item, index) in formData.params" :key="index">
              <el-input
                v-model="item.key"
                :placeholder="$t('menu.form.paramName')"
                style="width: 100px"
              />

              <span class="mx-1">=</span>

              <el-input
                v-model="item.value"
                :placeholder="$t('menu.form.paramValue')"
                style="width: 100px"
              />

              <el-icon
                v-if="formData.params.indexOf(item) === formData.params.length - 1"
                class="ml-2 cursor-pointer color-[var(--el-color-success)]"
                style="vertical-align: -0.15em"
                @click="formData.params.push({ key: '', value: '' })"
              >
                <CirclePlusFilled />
              </el-icon>
              <el-icon
                class="ml-2 cursor-pointer color-[var(--el-color-danger)]"
                style="vertical-align: -0.15em"
                @click="formData.params.splice(formData.params.indexOf(item), 1)"
              >
                <DeleteFilled />
              </el-icon>
            </div>
          </div>
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          prop="visible"
          :label="$t('menu.form.visible')"
        >
          <el-radio-group v-model="formData.visible">
            <el-radio :value="1">{{ $t("menu.visibleStatus.show") }}</el-radio>
            <el-radio :value="0">{{ $t("menu.visibleStatus.hide") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="formData.type === MenuTypeEnum.CATALOG || formData.type === MenuTypeEnum.MENU"
        >
          <template #label>
            <div class="flex-y-center">
              {{ $t("menu.form.alwaysShow") }}
              <el-tooltip placement="bottom" effect="light">
                <template #content>
                  {{ $t("menu.form.alwaysShowTooltip") }}
                </template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>

          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="1">{{ $t("menu.options.yes") }}</el-radio>
            <el-radio :value="0">{{ $t("menu.options.no") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="formData.type === MenuTypeEnum.MENU" :label="$t('menu.form.keepAlive')">
          <el-radio-group v-model="formData.keepAlive">
            <el-radio :value="1">{{ $t("menu.options.enable") }}</el-radio>
            <el-radio :value="0">{{ $t("menu.options.disable") }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="$t('menu.form.sort')" prop="sort">
          <el-input-number
            v-model="formData.sort"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <!-- 許可權標識 -->
        <el-form-item
          v-if="formData.type == MenuTypeEnum.BUTTON"
          :label="$t('menu.form.permission')"
          prop="perm"
        >
          <el-input v-model="formData.perm" :placeholder="$t('menu.form.permissionPlaceholder')" />
        </el-form-item>

        <el-form-item
          v-if="formData.type !== MenuTypeEnum.BUTTON"
          :label="$t('menu.form.icon')"
          prop="icon"
        >
          <!-- 圖示選擇器 -->
          <icon-select v-model="formData.icon" />
        </el-form-item>

        <el-form-item
          v-if="formData.type == MenuTypeEnum.CATALOG"
          :label="$t('menu.form.redirect')"
        >
          <el-input
            v-model="formData.redirect"
            :placeholder="$t('menu.form.redirectPlaceholder')"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">{{ $t("common.confirm") }}</el-button>
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device.enum";

import MenuAPI, { MenuQuery, MenuForm, MenuVO } from "@/api/system/menu-api";
import { MenuTypeEnum } from "@/enums/system/menu.enum";

defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

const appStore = useAppStore();
const { t } = useI18n();

const queryFormRef = ref();
const menuFormRef = ref();

const loading = ref(false);
const dialog = reactive({
  title: "新增選單",
  visible: false,
});

const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
// 查詢引數
const queryParams = reactive<MenuQuery>({});
// 選單表格資料
const menuTableData = ref<MenuVO[]>([]);
// 頂級選單下拉選項
const menuOptions = ref<OptionType[]>([]);
// 初始選單表單資料
const initialMenuFormData = ref<MenuForm>({
  id: undefined,
  parentId: "0",
  visible: 1,
  sort: 1,
  type: MenuTypeEnum.MENU, // 預設選單
  alwaysShow: 0,
  keepAlive: 1,
  params: [],
});
// 選單表單資料
const formData = ref({ ...initialMenuFormData.value });
// 表單驗證規則
const rules = computed(() => ({
  parentId: [{ required: true, message: t("menu.validation.parentRequired"), trigger: "blur" }],
  name: [{ required: true, message: t("menu.validation.nameRequired"), trigger: "blur" }],
  type: [{ required: true, message: t("menu.validation.typeRequired"), trigger: "blur" }],
  routeName: [{ required: true, message: t("menu.validation.routeNameRequired"), trigger: "blur" }],
  routePath: [{ required: true, message: t("menu.validation.pathRequired"), trigger: "blur" }],
  component: [{ required: true, message: t("menu.validation.componentRequired"), trigger: "blur" }],
  visible: [{ required: true, message: t("menu.validation.visibleRequired"), trigger: "change" }],
}));

// 選擇表格的行選單ID
const selectedMenuId = ref<string | undefined>();

// 查詢選單
function handleQuery() {
  loading.value = true;
  MenuAPI.getList(queryParams)
    .then((data) => {
      menuTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查詢
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行點選事件
function handleRowClick(row: MenuVO) {
  selectedMenuId.value = row.id;
}

/**
 * 開啟表單彈窗
 *
 * @param parentId 父選單ID
 * @param menuId 選單ID
 */
function handleOpenDialog(parentId?: string, menuId?: string) {
  MenuAPI.getOptions(true)
    .then((data) => {
      menuOptions.value = [{ value: "0", label: "頂級選單", children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        dialog.title = t("menu.form.editTitle");
        MenuAPI.getFormData(menuId).then((data) => {
          initialMenuFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        dialog.title = t("menu.form.title");
        formData.value.parentId = parentId?.toString();
      }
    });
}

// 選單型別切換
function handleMenuTypeChange() {
  // 如果選單型別改變
  if (formData.value.type !== initialMenuFormData.value.type) {
    if (formData.value.type === MenuTypeEnum.MENU) {
      // 目錄切換到選單時，清空元件路徑
      if (initialMenuFormData.value.type === MenuTypeEnum.CATALOG) {
        formData.value.component = "";
      } else {
        // 其他情況，保留原有的元件路徑
        formData.value.routePath = initialMenuFormData.value.routePath;
        formData.value.component = initialMenuFormData.value.component;
      }
    }
  }
}

/**
 * 提交表單
 */
function handleSubmit() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.value.id;
      if (menuId) {
        //修改時父級選單不能為當前選單
        if (formData.value.parentId == menuId) {
          ElMessage.error("父級選單不能為當前選單");
          return;
        }
        MenuAPI.update(menuId, formData.value).then(() => {
          ElMessage.success(t("common.updateSuccess"));
          handleCloseDialog();
          handleQuery();
        });
      } else {
        MenuAPI.create(formData.value).then(() => {
          ElMessage.success(t("common.addSuccess"));
          handleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

// 刪除選單
function handleDelete(menuId: string) {
  if (!menuId) {
    ElMessage.warning("請勾選刪除項");
    return false;
  }

  ElMessageBox.confirm(t("common.confirmDelete"), t("common.warning"), {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      MenuAPI.deleteById(menuId)
        .then(() => {
          ElMessage.success(t("common.deleteSuccess"));
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消刪除");
    }
  );
}

function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.value = {
    id: undefined,
    parentId: "0",
    visible: 1,
    sort: 1,
    type: MenuTypeEnum.MENU, // 預設選單
    alwaysShow: 0,
    keepAlive: 1,
    params: [],
  };
}

// 關閉彈窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>
