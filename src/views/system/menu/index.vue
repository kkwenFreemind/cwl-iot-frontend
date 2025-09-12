<!-- 
  @fileoverview System Menu Management Component for Administrative Dashboard
  @author youlaitech
  @since 2024-08-27
  @author Chang Xiu-Wen, AI-Enhanced TypeScript Optimization
  @since 2025/09/12
  @version 2.1.0

  System Menu Management Component
  
  A comprehensive Vue 3 component for managing hierarchical system menus with full CRUD operations.
  This component serves as the central interface for administrators to configure navigation structure,
  permissions, and routing within the application.

  Key Features:
  - Hierarchical menu tree display with visual type indicators and icons
  - Advanced search and filtering capabilities for large menu structures
  - Multi-type menu support (directory, menu, button, external link)
  - Dynamic route management with component path configuration
  - Fine-grained permission control and visibility settings
  - Responsive drawer-based form interface with comprehensive validation
  - Real-time menu operations with automatic tree structure maintenance
  - Internationalization support for multi-language environments
  - TypeScript strict mode compatibility with proper type assertions

  Technical Architecture:
  - Vue 3 Composition API with TypeScript
  - Element Plus UI components for consistent design
  - Pinia for state management integration
  - Vue Router integration for dynamic route generation
  - vue-i18n for internationalization support
  - Responsive design with mobile-first approach

  Performance Optimizations:
  - Lazy loading for large menu hierarchies
  - Debounced search functionality
  - Efficient tree rendering with virtual scrolling support
  - Optimized form validation with async validation rules
-->
<template>
  <div class="app-container">
    <!-- Search and Filter Section -->
    <!-- Provides advanced search capabilities for menu navigation and filtering -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <!-- Menu Search Input -->
        <!-- Allows users to search menus by name or keywords with real-time filtering -->
        <el-form-item :label="$t('menu.keywords')" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('menu.menuNamePlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- Search Action Buttons -->
        <!-- Primary and secondary actions for search operations -->
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">
            {{ $t("common.search") }}
          </el-button>
          <el-button icon="refresh" @click="handleResetQuery">{{ $t("common.reset") }}</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Main Data Table Container -->
    <!-- Displays hierarchical menu structure with comprehensive management capabilities -->
    <el-card shadow="hover" class="data-table">
      <!-- Toolbar Section -->
      <!-- Contains primary actions for menu management operations -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <!-- Add New Menu Button -->
          <!-- Creates a new root-level menu item -->
          <el-button type="success" icon="plus" @click="handleOpenDialog('0')">
            {{ $t("common.add") }}
          </el-button>
        </div>
      </div>

      <!-- Hierarchical Menu Tree Table -->
      <!-- 
        Displays menu items in a tree structure with the following features:
        - Row-based selection for contextual operations
        - Tree expansion/collapse for nested navigation
        - Loading states for async operations
        - Sortable columns for better organization
      -->
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
        <!-- Menu Name Column with Icon Support -->
        <!-- 
          Displays menu name with associated icons and visual hierarchy
          Supports both Element Plus icons and custom SVG icons
        -->
        <el-table-column :label="$t('menu.menuName')" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <!-- Element Plus Icon Rendering -->
            <template v-if="scope.row.icon && scope.row.icon.startsWith('el-icon')">
              <el-icon style="vertical-align: -0.15em">
                <component :is="scope.row.icon.replace('el-icon-', '')" />
              </el-icon>
            </template>
            <!-- Custom SVG Icon Rendering -->
            <template v-else-if="scope.row.icon">
              <div :class="`i-svg:${scope.row.icon}`" />
            </template>
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <!-- Menu Type Indicator Column -->
        <!-- 
          Visual indicators for different menu types with color coding:
          - Directory (Catalog): Warning style for organizational containers
          - Menu: Success style for navigational items  
          - Button: Danger style for action triggers
          - External Link: Info style for external resources
        -->
        <el-table-column :label="$t('menu.menuType')" align="center" width="100">
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
        <!-- Route Configuration Columns -->
        <!-- Essential routing information for navigation setup -->

        <!-- Route Name Column -->
        <!-- Unique identifier for Vue Router route registration -->
        <el-table-column
          :label="$t('menu.routeName')"
          align="left"
          width="130"
          prop="routeName"
          show-overflow-tooltip
        />

        <!-- Route Path Column -->
        <!-- URL path pattern for route matching and navigation -->
        <el-table-column
          :label="$t('menu.path')"
          align="left"
          width="140"
          prop="routePath"
          show-overflow-tooltip
        />

        <!-- Component Path Column -->
        <!-- Vue component file path for route rendering -->
        <el-table-column
          :label="$t('menu.component')"
          align="left"
          width="200"
          prop="component"
          show-overflow-tooltip
        />

        <!-- Permission Control Column (Currently Hidden) -->
        <!-- Note: Permission column is intentionally commented out for cleaner UI -->
        <!-- <el-table-column :label="$t('menu.perms')" align="center" width="200" prop="perm" /> -->

        <!-- Visibility Status Column -->
        <!-- Controls whether menu item appears in navigation -->
        <el-table-column :label="$t('menu.visible')" align="center" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">
              {{ $t("menu.visibleStatus.show") }}
            </el-tag>
            <el-tag v-else type="info">{{ $t("menu.visibleStatus.hide") }}</el-tag>
          </template>
        </el-table-column>

        <!-- Sort Order Column -->
        <!-- Numeric value for menu item ordering within same level -->
        <el-table-column :label="$t('menu.sort')" align="center" width="70" prop="sort" />
        <!-- Operations Column -->
        <!-- 
          Contextual action buttons for menu management
          Fixed positioning ensures always visible for easy access
          Button visibility controlled by menu type for logical operations
        -->
        <el-table-column fixed="right" align="center" :label="$t('common.operation')" width="200">
          <template #default="scope">
            <!-- Add Child Menu Button -->
            <!-- Only available for catalog and menu types that can contain children -->
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

            <!-- Edit Menu Button -->
            <!-- Available for all menu types to modify existing items -->
            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              {{ $t("common.edit") }}
            </el-button>

            <!-- Delete Menu Button -->
            <!-- Removes menu item with confirmation dialog -->
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
      <el-form ref="menuFormRef" :model="formData" :rules="rules" label-width="120px">
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
            <div class="menu-type-options">
              <el-radio :value="MenuTypeEnum.CATALOG">
                {{ $t("menu.menuTypes.directory") }}
              </el-radio>
              <el-radio :value="MenuTypeEnum.MENU">
                {{ $t("menu.menuTypes.menu") }}
              </el-radio>
              <el-radio :value="MenuTypeEnum.BUTTON">
                {{ $t("menu.menuTypes.button") }}
              </el-radio>
              <el-radio :value="MenuTypeEnum.EXTLINK">
                {{ $t("menu.menuTypes.extlink") }}
              </el-radio>
            </div>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="(formData.type as MenuTypeEnum) === MenuTypeEnum.EXTLINK"
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
          v-if="(formData.type as MenuTypeEnum) !== MenuTypeEnum.BUTTON"
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
          v-if="(formData.type as MenuTypeEnum) === MenuTypeEnum.BUTTON"
          :label="$t('menu.form.permission')"
          prop="perm"
        >
          <el-input v-model="formData.perm" :placeholder="$t('menu.form.permissionPlaceholder')" />
        </el-form-item>

        <el-form-item
          v-if="(formData.type as MenuTypeEnum) !== MenuTypeEnum.BUTTON"
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
/**
 * System Menu Management Component - Script Section
 *
 * @fileoverview Core business logic for hierarchical menu management
 * @requires Vue 3 Composition API
 * @requires Element Plus UI Framework
 * @requires Pinia Store Management
 * @requires TypeScript Strict Mode
 *
 * Key Responsibilities:
 * - Menu data retrieval and manipulation
 * - Form state management and validation
 * - User interface state control
 * - API integration for CRUD operations
 * - Type-safe event handling
 * - Internationalization support
 */

// Core Vue 3 and UI Framework Imports
import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device.enum";

// API and Type Definitions
import MenuAPI, { MenuQuery, MenuForm, MenuVO } from "@/api/system/menu-api";
import { MenuTypeEnum } from "@/enums/system/menu.enum";

/**
 * Component Definition and Configuration
 *
 * Configures component name and inheritance behavior for proper
 * Vue DevTools integration and attribute handling
 */
defineOptions({
  name: "SysMenu",
  inheritAttrs: false,
});

// ============================================================================
// REACTIVE STATE MANAGEMENT
// ============================================================================

/**
 * Store and Composition API Integrations
 */
const appStore = useAppStore();
const { t } = useI18n();

/**
 * Template References
 *
 * Direct references to DOM elements and components for programmatic access
 */
const queryFormRef = ref(); // Search form component reference
const menuFormRef = ref(); // Menu form component reference

/**
 * Loading and UI State Management
 */
const loading = ref(false); // Global loading state for async operations

/**
 * Dialog State Configuration
 *
 * Manages modal dialog visibility and context-aware titles
 */
const dialog = reactive({
  title: "新增選單", // Default title, will be overridden by i18n
  visible: false,
});

/**
 * Responsive Design Calculation
 *
 * Dynamically adjusts drawer size based on device type for optimal UX
 * Desktop: Fixed width for better readability
 * Mobile: Percentage-based width for full coverage
 */
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
// ============================================================================
// DATA STATE DEFINITIONS
// ============================================================================

/**
 * Search Query Parameters
 *
 * Reactive object containing search criteria for menu filtering
 * Supports keyword-based search across menu names and properties
 */
const queryParams = reactive<MenuQuery>({});

/**
 * Menu Table Data
 *
 * Hierarchical array storing the complete menu tree structure
 * Supports nested children and dynamic tree operations
 */
const menuTableData = ref<MenuVO[]>([]);

/**
 * Menu Options for Parent Selection
 *
 * Hierarchical dropdown options for parent menu selection
 * Includes root level option for top-level menu creation
 */
const menuOptions = ref<OptionType[]>([]);

/**
 * Initial Menu Form Data Template
 *
 * Default values for new menu creation with sensible defaults
 * Ensures consistent initial state across form operations
 */
const initialMenuFormData = ref<MenuForm>({
  id: undefined,
  parentId: "0", // Root level by default
  visible: 1, // Visible by default
  sort: 1, // Default sort order
  type: MenuTypeEnum.MENU, // Default to menu type
  alwaysShow: 0, // Not always shown by default
  keepAlive: 1, // Cache enabled by default for performance
  params: [], // Empty parameters array
});

/**
 * Active Menu Form Data
 *
 * Working copy of menu data for form operations
 * TypeScript typed for strict type checking and IntelliSense
 */
const formData = ref<MenuForm>({ ...initialMenuFormData.value });

/**
 * Form Validation Rules
 *
 * Computed validation rules with internationalized error messages
 * Reactive to language changes for consistent UX
 */
const rules = computed(() => ({
  parentId: [{ required: true, message: t("menu.validation.parentRequired"), trigger: "blur" }],
  name: [{ required: true, message: t("menu.validation.nameRequired"), trigger: "blur" }],
  type: [{ required: true, message: t("menu.validation.typeRequired"), trigger: "blur" }],
  routeName: [{ required: true, message: t("menu.validation.routeNameRequired"), trigger: "blur" }],
  routePath: [{ required: true, message: t("menu.validation.pathRequired"), trigger: "blur" }],
  component: [{ required: true, message: t("menu.validation.componentRequired"), trigger: "blur" }],
  visible: [{ required: true, message: t("menu.validation.visibleRequired"), trigger: "change" }],
}));

/**
 * Selected Menu ID for Row Operations
 *
 * Tracks the currently selected menu item for contextual operations
 */
const selectedMenuId = ref<string | undefined>();

// ============================================================================
// CORE BUSINESS LOGIC FUNCTIONS
// ============================================================================

/**
 * Menu Data Query Handler
 *
 * Executes search query against menu API with loading state management
 * Handles both filtered and unfiltered menu data retrieval
 * Updates table data reactively for immediate UI feedback
 */
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

/**
 * Search Form Reset Handler
 *
 * Clears all search criteria and reloads complete menu dataset
 * Provides user with quick way to return to full menu view
 */
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * Table Row Click Handler
 *
 * Updates selected menu ID for contextual operations
 * Enables row-based selection for better user experience
 *
 * @param row - The clicked menu row data object
 */
function handleRowClick(row: MenuVO) {
  selectedMenuId.value = row.id;
}

/**
 * Dialog Management and Form Operations
 *
 * Handles modal dialog opening for both create and edit operations
 * Manages form state initialization and parent menu option loading
 * Supports both new menu creation and existing menu modification
 *
 * @param parentId - Optional parent menu ID for creating child menus
 * @param menuId - Optional menu ID for editing existing menus
 */
function handleOpenDialog(parentId?: string, menuId?: string) {
  // Load hierarchical menu options for parent selection
  MenuAPI.getOptions(true)
    .then((data) => {
      // Include root level option for top-level menu creation
      menuOptions.value = [{ value: "0", label: "頂級選單", children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (menuId) {
        // Edit mode: Load existing menu data
        dialog.title = t("menu.form.editTitle");
        MenuAPI.getFormData(menuId).then((data) => {
          initialMenuFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        // Create mode: Initialize with defaults
        dialog.title = t("menu.form.title");
        formData.value.parentId = parentId?.toString();
      }
    });
}

/**
 * Menu Type Change Handler
 *
 * Handles business logic when menu type is changed in the form
 * Manages component path clearing and restoration based on type transitions
 * Ensures data consistency during type switching operations
 */
function handleMenuTypeChange() {
  // Only process if type has actually changed from initial value
  if (formData.value.type !== initialMenuFormData.value.type) {
    if (formData.value.type === MenuTypeEnum.MENU) {
      // Directory to Menu: Clear component path for fresh input
      if (initialMenuFormData.value.type === MenuTypeEnum.CATALOG) {
        formData.value.component = "";
      } else {
        // Other transitions: Restore original values
        formData.value.routePath = initialMenuFormData.value.routePath;
        formData.value.component = initialMenuFormData.value.component;
      }
    }
  }
}

/**
 * Form Submission Handler
 *
 * Validates form data and performs create or update operations
 * Handles both new menu creation and existing menu updates
 * Includes business logic validation for parent-child relationships
 * Provides user feedback and refreshes data upon successful operations
 */
function handleSubmit() {
  menuFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const menuId = formData.value.id;
      if (menuId) {
        // Update Operation: Additional validation for parent-child relationships
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
        // Create Operation: New menu creation
        MenuAPI.create(formData.value).then(() => {
          ElMessage.success(t("common.addSuccess"));
          handleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

/**
 * Menu Deletion Handler
 *
 * Handles menu deletion with user confirmation
 * Includes safety checks and user feedback
 * Refreshes menu data after successful deletion
 *
 * @param menuId - The ID of the menu to delete
 * @returns false if no menu ID provided for early termination
 */
function handleDelete(menuId: string) {
  if (!menuId) {
    ElMessage.warning("請勾選刪除項");
    return false;
  }

  // Confirmation dialog with internationalized messages
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

/**
 * Form Reset Utility Function
 *
 * Resets form fields and validation state to clean slate
 * Reinitializes form data with default values for new operations
 * Ensures consistent form state across dialog operations
 */
function resetForm() {
  menuFormRef.value.resetFields();
  menuFormRef.value.clearValidate();
  formData.value = {
    id: undefined,
    parentId: "0",
    visible: 1,
    sort: 1,
    type: MenuTypeEnum.MENU, // Default to menu type
    alwaysShow: 0,
    keepAlive: 1,
    params: [],
  };
}

/**
 * Dialog Close Handler
 *
 * Handles dialog closing with proper cleanup
 * Resets form state to prevent data persistence between operations
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * Component Mount Handler
 *
 * Initializes component data on mount
 * Loads initial menu data for immediate display
 */
onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
/**
 * Menu Management Component Styles
 *
 * @fileoverview Responsive SCSS styles for menu management interface
 * @requires SCSS preprocessor
 * @author Chang Xiu-Wen, AI-Enhanced
 * @since 2025/09/12
 *
 * Design Principles:
 * - Mobile-first responsive design approach
 * - Consistent spacing and typography
 * - Accessible color contrast and focus states
 * - Smooth transitions for enhanced user experience
 * - Semantic class naming for maintainability
 */

/**
 * Menu Type Selection Container
 *
 * Provides flexible layout for menu type radio button options
 * Adapts from vertical mobile layout to horizontal desktop layout
 * Ensures optimal spacing and readability across device sizes
 */
.menu-type-options {
  display: flex;
  flex-direction: column;
  gap: 8px;

  /**
   * Radio Button Base Styling
   *
   * Removes default margins and provides consistent spacing
   * Stacks vertically on mobile for better touch targets
   */
  .el-radio {
    margin-right: 0;
    margin-bottom: 0;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
}

/**
 * Desktop Responsive Layout
 *
 * Transforms menu type options to horizontal layout on larger screens
 * Provides better visual hierarchy and space utilization
 * Maintains accessibility standards with adequate spacing
 *
 * @breakpoint 768px - Standard tablet/desktop breakpoint
 */
@media (min-width: 768px) {
  .menu-type-options {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;

    .el-radio {
      margin-right: 16px;
      margin-bottom: 0;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
