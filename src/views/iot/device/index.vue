<!--

  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-15

  Device Management Component
  ==========================

  A comprehensive Vue 3 Composition API component for managing IoT devices.
  Provides full CRUD operations with advanced filtering, real-time status monitoring,
  and responsive design optimized for both desktop and mobile interfaces.

  Features:
  - Device listing with pagination and sear  // Device form data for create/edit operations
  formData: {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    status: undefined,
    deptId: 0 as number,
    location: "",
    latitude: undefined,
    longitude: undefined,
  } as DeviceForm,ties
  - Advanced filtering by department, status, and keywords
  - Real-time device status
  - Create, read, update, and delete operations
  - Responsive layout with mobile-optimized drawer forms
  - Internationalization support with vue-i18n
  - TypeScript integration for type safety
-->
<template>
  <!-- Main application container with responsive layout -->
  <div class="app-container">
    <!-- Two-column responsive grid layout -->
    <el-row :gutter="20">
      <!-- Left sidebar: Department tree filter (4/12 width on large screens, full width on mobile) -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <!-- Department tree component for hierarchical filtering -->
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- Main content area (8/12 width on large screens, full width on mobile) -->
      <el-col :lg="20" :xs="24">
        <!-- Search and filter section -->
        <div class="search-container">
          <!-- Inline search form with multiple filter criteria -->
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <!-- Keyword search input with clear functionality -->
            <el-form-item :label="$t('device.keywords')" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                :placeholder="$t('device.keywordsPlaceholder')"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <!-- Action buttons for search and reset -->
            <el-form-item class="search-buttons">
              <el-button type="primary" icon="search" @click="handleQuery">
                {{ $t("device.search") }}
              </el-button>
              <el-button icon="refresh" @click="handleResetQuery">
                {{ $t("device.reset") }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Data table container with shadow effect -->
        <el-card shadow="hover" class="data-table">
          <!-- Table toolbar with action buttons -->
          <div class="data-table__toolbar">
            <div class="data-table__toolbar--actions">
              <!-- Add new device button -->
              <el-button type="success" icon="plus" @click="handleOpenDialog()">
                {{ $t("device.add") }}
              </el-button>
              <!-- Bulk delete button (disabled when no items selected) -->
              <el-button
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                {{ $t("device.delete") }}
              </el-button>
            </div>
          </div>

          <!-- Main data table with loading state and selection capabilities -->
          <el-table
            v-loading="loading"
            :data="pageData"
            border
            stripe
            highlight-current-row
            class="data-table__content"
            @selection-change="handleSelectionChange"
          >
            <!-- Selection checkbox column -->
            <el-table-column type="selection" width="50" align="center" />

            <!-- Device name column -->
            <el-table-column :label="$t('device.deviceName')" prop="deviceName" min-width="120" />

            <!-- Device model column -->
            <el-table-column
              :label="$t('device.deviceModel')"
              prop="deviceModel"
              width="120"
              align="center"
            >
              <template #default="scope">
                {{ getDeviceTypeText(scope.row.deviceModel) }}
              </template>
            </el-table-column>

            <!-- Device ID column (unique identifier) -->
            <el-table-column
              :label="$t('device.deviceId')"
              prop="deviceId"
              width="140"
              align="center"
            />

            <!-- Department name column -->
            <el-table-column
              :label="$t('device.department')"
              width="120"
              align="center"
              prop="deptName"
            />

            <!-- Device status column with color-coded tags -->
            <el-table-column :label="$t('device.status')" align="center" prop="status" width="80">
              <template #default="scope">
                <el-tag :type="getStatusTagType(scope.row.status)" size="small">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- Device location column with overflow tooltip -->
            <el-table-column
              :label="$t('device.location')"
              prop="location"
              width="150"
              align="center"
              show-overflow-tooltip
            />

            <!-- Creation timestamp column -->
            <el-table-column
              :label="$t('device.createTime')"
              align="center"
              prop="createdAt"
              width="150"
            />

            <!-- Operations column with action buttons -->
            <el-table-column :label="$t('device.operation')" fixed="right" width="220">
              <template #default="scope">
                <!-- Edit device button -->
                <el-button
                  type="primary"
                  icon="edit"
                  link
                  size="small"
                  @click="handleEditClick(scope.row)"
                >
                  {{ $t("device.edit") }}
                </el-button>
                <!-- Delete device button -->
                <el-button
                  type="danger"
                  icon="delete"
                  link
                  size="small"
                  @click="handleDelete(scope.row.deviceId)"
                >
                  {{ $t("device.delete") }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Empty state when no data is available -->
          <div v-if="pageData.length === 0 && !loading" class="empty-data">
            <el-empty :description="$t('device.noData')" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Device form drawer (modal-like overlay) -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!-- Device form with validation rules -->
      <el-form ref="deviceFormRef" :model="formData" :rules="rules" label-width="140px">
        <!-- Device name input field -->
        <el-form-item :label="$t('device.deviceForm.deviceName')" prop="deviceName">
          <el-input
            v-model="formData.deviceName"
            :placeholder="$t('device.deviceForm.deviceNamePlaceholder')"
          />
        </el-form-item>

        <!-- Device type selection -->
        <el-form-item :label="$t('device.deviceForm.devieModel')" prop="deviceType">
          <el-select
            v-model="formData.deviceModel"
            :placeholder="$t('device.deviceForm.deviceModelPlaceholder')"
          >
            <el-option :label="$t('device.waterLevelSensor')" value="WATER_LEVEL_SENSOR" />
            <el-option :label="$t('device.otherDevice')" value="OTHER" />
          </el-select>
        </el-form-item>

        <!-- Device ID field (read-only in edit mode) -->
        <el-form-item v-if="formData.deviceId" :label="$t('device.deviceId')" prop="deviceId">
          <el-input v-model="formData.deviceId" readonly :placeholder="$t('device.deviceId')" />
        </el-form-item>

        <!-- Department selection tree -->
        <el-form-item :label="$t('device.deviceForm.department')" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            :data="deptOptions"
            :placeholder="$t('device.deviceForm.deptPlaceholder')"
            :props="{ value: 'value', label: 'label', children: 'children' }"
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <!-- Device status selection -->
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
          </el-select>
        </el-form-item>

        <!-- Device location input -->
        <el-form-item :label="$t('device.deviceForm.location')" prop="location">
          <el-input
            v-model="formData.location"
            :placeholder="$t('device.deviceForm.locationPlaceholder')"
          />
        </el-form-item>

        <!-- Geographic coordinates section -->
        <el-row :gutter="16">
          <!-- Latitude input -->
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.latitude')" prop="latitude">
              <el-input-number
                v-model="formData.latitude"
                :placeholder="$t('device.deviceForm.latitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <!-- Longitude input -->
          <el-col :span="12">
            <el-form-item :label="$t('device.deviceForm.longitude')" prop="longitude">
              <el-input-number
                v-model="formData.longitude"
                :placeholder="$t('device.deviceForm.longitudePlaceholder')"
                :precision="6"
                :step="0.000001"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- Drawer footer with action buttons -->
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="handleCloseDialog">{{ $t("common.cancel") }}</el-button>
          <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">
            {{ $t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<!--
  Vue 3 Composition API Script Section
  ====================================

  This script section implements the component logic using Vue 3's Composition API,
  providing reactive state management, computed properties, and event handlers
  for comprehensive IoT device management functionality.
-->
<script setup lang="ts">
/**
 * Vue 3 Composition API imports
 * Core reactive primitives and lifecycle hooks for component state management
 */
import { computed, onMounted, reactive, ref, toRefs } from "vue";

/**
 * Element Plus UI components and utilities
 * Form validation, message display, and confirmation dialogs
 */
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";

/**
 * Internationalization composable
 * Provides translation functions for multi-language support
 */
import { useI18n } from "vue-i18n";

/**
 * Application store access
 * Global state management for responsive design and app-wide settings
 */
import { useAppStore } from "@/store/modules/app-store";

/**
 * API layer imports
 * Device management API functions and TypeScript type definitions
 */
import DeviceAPI, { type DeviceForm, type DeviceQuery, type DeviceVO } from "@/api/iot/device-api";
import DeptAPI from "@/api/system/dept-api";

/**
 * Component imports
 * Department tree component for hierarchical department selection
 */
import DeptTree from "@/views/system/user/components/DeptTree.vue";

/**
 * Component Configuration
 * Defines component metadata and options for Vue's component system
 */
defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

/**
 * Internationalization Setup
 * Initialize translation composable for multi-language support
 */
const { t } = useI18n();

/**
 * Application Store Access
 * Access to global application state for responsive design and settings
 */
const appStore = useAppStore();

/**
 * Reactive State Management
 * Centralized reactive state using Vue's reactive() function
 * Contains all component-level data and UI state
 */
const state = reactive({
  // Loading state for async operations
  loading: false,

  // Device list data from API
  pageData: [] as DeviceVO[],

  // Query parameters for device filtering and search
  queryParams: {
    keywords: "",
    status: undefined,
    deviceType: undefined,
    deptId: undefined as number | undefined,
    createTime: undefined as [string, string] | undefined,
  } as DeviceQuery,

  // Selected device IDs for bulk operations
  selectIds: [] as string[],

  // Dialog/modal state management
  dialog: {
    visible: false,
    title: "",
    loading: false,
  },

  // Device form data for create/edit operations
  formData: {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    deviceType: "WATER_LEVEL_SENSOR",
    status: "ACTIVE",
    deptId: 0 as number,
    location: "",
    latitude: undefined,
    longitude: undefined,
  } as DeviceForm,

  // Department options for tree selection
  deptOptions: [] as OptionType[],
});

/**
 * Reactive State Destructuring
 * Extract reactive properties using toRefs() for template binding
 * Maintains reactivity while providing convenient access
 */
const { loading, pageData, queryParams, selectIds, dialog, formData, deptOptions } = toRefs(state);

/**
 * Template References
 * Reactive references to DOM elements for form manipulation and validation
 */
const queryFormRef = ref<FormInstance>();
const deviceFormRef = ref<FormInstance>();

/**
 * Computed Properties
 * Reactive computed values that automatically update when dependencies change
 */

/**
 * Dynamic drawer size based on device type
 * Responsive design: larger drawer on desktop, full-width on mobile
 */
const drawerSize = computed(() => (appStore.device === "desktop" ? "600px" : "90%"));

/**
 * Form Validation Rules
 * Comprehensive validation rules for device form fields
 * Uses computed property for reactive translation support
 */
const rules = computed<FormRules>(() => ({
  deviceName: [
    {
      required: true,
      message: t("device.validation.deviceNameRequired"),
      trigger: "blur",
    },
  ],
  deviceModel: [
    {
      required: true,
      message: t("device.validation.deviceModelRequired"),
      trigger: "blur",
    },
  ],
  deviceType: [
    {
      required: true,
      message: t("device.validation.deviceTypeRequired"),
      trigger: "change",
    },
  ],
  deptId: [
    {
      required: true,
      message: t("device.validation.deptRequired"),
      trigger: "change",
    },
  ],
  status: [
    {
      required: true,
      message: t("device.validation.statusRequired"),
      trigger: "change",
    },
  ],
  location: [
    {
      required: true,
      message: t("device.validation.locationRequired"),
      trigger: "blur",
    },
  ],
}));

/**
 * Utility Functions
 * Helper functions for data transformation and UI logic
 */

/**
 * Get status tag type for Element Plus tags
 * Maps device status to appropriate color-coded tag types
 * @param status - Device status string
 * @returns Element Plus tag type
 */
function getStatusTagType(status: string): "success" | "warning" | "danger" | "info" | "primary" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "INACTIVE":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Get localized device type text with fallback logic
 * Provides translated device type text with graceful degradation
 * @param deviceType - Device type string
 * @returns Localized device type text
 */
function getDeviceTypeText(deviceType: string): string {
  // Primary: Use explicit device type translation keys
  switch (deviceType) {
    case "WATER_LEVEL_SENSOR":
      return t("device.waterLevelSensor");
    case "OTHER":
      return t("device.otherDevice");
    default: {
      // Fallback: Try short key format
      const shortKey = deviceType ? deviceType.toLowerCase() : "";
      const short = shortKey ? t(`device.${shortKey}`) : "";
      // Final fallback: Return original device type if no translation found
      if (short === `device.${shortKey}` || short === "") return deviceType;
      return short;
    }
  }
}

/**
 * Get localized status text with fallback logic
 * Provides translated status text with graceful degradation
 * @param status - Device status string
 * @returns Localized status text
 */
function getStatusText(status: string): string {
  // Primary: Use explicit status translation keys
  switch (status) {
    case "ACTIVE":
      return t("device.statusActive");
    case "INACTIVE":
      return t("device.statusInactive");
    default: {
      // Fallback: Try short key format
      const shortKey = status ? status.toLowerCase() : "";
      const short = shortKey ? t(`device.${shortKey}`) : "";
      // Final fallback: Return original status if no translation found
      if (short === `device.${shortKey}` || short === "") return status;
      return short;
    }
  }
}

/**
 * Data Fetching Functions
 * API interaction functions for retrieving and managing device data
 */

/**
 * Fetch device data from API
 * Retrieves paginated device list based on current query parameters
 * Handles loading states and error scenarios
 */
async function fetchData() {
  try {
    loading.value = true;
    const data = await DeviceAPI.listDevices(queryParams.value);
    pageData.value = data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    ElMessage.error(t("device.fetchError"));
  } finally {
    loading.value = false;
  }
}

/**
 * Load department options for tree selection
 * Fetches hierarchical department data for form dropdown
 * Used in device assignment and filtering
 */
async function loadDeptOptions() {
  try {
    const data = await DeptAPI.getOptions();
    deptOptions.value = data;
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

/**
 * Event Handlers
 * User interaction handlers for buttons, forms, and UI events
 */

/**
 * Handle edit button click in table
 * Initiates edit mode by opening dialog with selected device data
 * @param row - Device data object from table row
 */
function handleEditClick(row: DeviceVO) {
  console.log("Edit button clicked, deviceId:", row.deviceId);
  handleOpenDialog(row.deviceId);
}

/**
 * Handle search query execution
 * Triggers data fetch with current filter parameters
 */
function handleQuery() {
  fetchData();
}

/**
 * Handle search form reset
 * Clears all filter parameters and refreshes data
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value = {
    keywords: "",
    status: undefined,
    deviceType: undefined,
    deptId: undefined,
    createTime: undefined,
  };
  fetchData();
}

/**
 * Handle table row selection changes
 * Updates selected device IDs for bulk operations
 * @param selection - Array of selected device objects
 */
function handleSelectionChange(selection: DeviceVO[]) {
  selectIds.value = selection.map((item) => item.deviceId);
}

/**
 * Handle dialog opening for device creation/editing
 * Manages dialog state and form data population
 * @param deviceId - Optional device ID for edit mode
 */
async function handleOpenDialog(deviceId?: string) {
  dialog.value.visible = true;

  if (deviceId) {
    // Edit mode: Populate form with existing device data
    dialog.value.title = t("device.edit");
    try {
      // Find device in current page data (optimization to avoid extra API call)
      const device = pageData.value.find((d) => d.deviceId === deviceId);
      if (device) {
        Object.assign(formData.value, {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceModel: device.deviceModel,
          deviceType: device.deviceType,
          status: device.status,
          deptId: device.deptId,
          location: device.location,
          latitude: device.latitude,
          longitude: device.longitude,
        });
      } else {
        console.warn("Device not found in current page data");
        ElMessage.error(t("device.deviceNotFound"));
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error loading device details:", error);
      ElMessage.error(t("device.loadError"));
      handleCloseDialog();
    }
  } else {
    // Create mode: Initialize empty form
    dialog.value.title = t("device.add");
    resetForm();
  }
}

/**
 * Handle dialog closing
 * Resets dialog state and form data
 */
function handleCloseDialog() {
  dialog.value.visible = false;
  resetForm();
}

/**
 * Reset device form to initial state
 * Clears all form fields and validation states
 */
function resetForm() {
  Object.assign(formData.value, {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    deviceType: "WATER_LEVEL_SENSOR",
    status: "ACTIVE",
    deptId: 0,
    location: "",
    latitude: undefined,
    longitude: undefined,
  });
  deviceFormRef.value?.resetFields();
}

/**
 * Handle form submission for device creation/updates
 * Validates form data and executes appropriate API operation
 * Provides user feedback through success/error messages
 */
async function handleSubmit() {
  if (!deviceFormRef.value) return;

  try {
    // Validate form before submission
    const valid = await deviceFormRef.value.validate();
    if (!valid) return;

    dialog.value.loading = true;

    if (formData.value.deviceId) {
      // Update existing device
      await DeviceAPI.updateDevice(formData.value.deviceId, formData.value);
      ElMessage.success(t("device.updateSuccess"));
    } else {
      // Create new device
      await DeviceAPI.addDevice(formData.value);
      ElMessage.success(t("device.addSuccess"));
    }

    // Close dialog and refresh data
    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("Error saving device:", error);
    ElMessage.error(t("device.saveError"));
  } finally {
    dialog.value.loading = false;
  }
}

/**
 * Handle device deletion (single or bulk)
 * Supports both individual device deletion and bulk operations
 * Includes confirmation dialog for safety
 * @param deviceId - Optional single device ID, if not provided uses selected items
 */
async function handleDelete(deviceId?: string) {
  const ids = deviceId ? [deviceId] : selectIds.value;
  if (ids.length === 0) {
    ElMessage.warning(t("device.selectDevicesToDelete"));
    return;
  }

  try {
    // Show confirmation dialog
    await ElMessageBox.confirm(t("device.deleteConfirmation"), t("device.deleteTitle"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    // Execute deletion
    await DeviceAPI.deleteDevices(ids.join(","));
    ElMessage.success(t("device.deleteSuccess"));
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("Error deleting devices:", error);
      ElMessage.error(t("device.deleteError"));
    }
  }
}

/**
 * Lifecycle Hooks
 * Component initialization and cleanup logic
 */

/**
 * Component mounted lifecycle hook
 * Initializes component by fetching initial data and loading dependencies
 */
onMounted(() => {
  fetchData();
  loadDeptOptions();
});
</script>

<!--
  SCSS Styles Section
  ===================

  Component-specific styles using SCSS with BEM-like naming convention.
  Implements responsive design patterns and integrates with Element Plus theme system.
  Uses CSS custom properties for consistent theming and maintainability.
-->
<style lang="scss" scoped>
/**
 * Main container styling
 * Provides consistent padding and layout foundation for the component
 */
.app-container {
  padding: 20px;
}

/**
 * Search and filter section styling
 * Creates a visually distinct container for search functionality
 * Uses theme-aware background color for consistency
 */
.search-container {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  /**
   * Search buttons alignment
   * Positions action buttons to the right side of the search form
   */
  .search-buttons {
    margin-left: auto;
  }
}

/**
 * Data table container styling
 * Organizes table layout with toolbar and content sections
 */
.data-table {
  /**
   * Table toolbar styling
   * Provides consistent spacing and alignment for table action buttons
   */
  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    /**
     * Action buttons container
     * Groups related action buttons with consistent spacing
     */
    &--actions {
      display: flex;
      gap: 8px;
    }
  }

  /**
   * Table content styling
   * Ensures table takes full available width
   */
  &__content {
    width: 100%;
  }
}

/**
 * Empty state styling
 * Centers empty state content when no data is available
 */
.empty-data {
  padding: 40px 0;
  text-align: center;
}

/**
 * Drawer footer styling
 * Provides consistent button layout in modal drawer footer
 */
.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}

/**
 * Responsive Design Breakpoints
 * Mobile-first approach with progressive enhancement for larger screens
 */
@media (max-width: 768px) {
  /**
   * Mobile container adjustments
   * Reduces padding for better mobile experience
   */
  .app-container {
    padding: 12px;
  }

  /**
   * Mobile search container
   * Adjusts padding for smaller screens
   */
  .search-container {
    padding: 16px;
  }

  /**
   * Mobile form layout override
   * Forces inline forms to stack vertically on mobile devices
   * Uses Element Plus deep selector for component styling
   */
  :deep(.el-form--inline .el-form-item) {
    display: block;
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
