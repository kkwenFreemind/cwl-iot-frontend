<!--
  Device Management Component - IoT Device CRUD Interface

  This component provides a comprehensive interface for managing IoT devices within the
  Community Water Level monitoring system. It implements full CRUD operations with
  advanced features including:

  Features:
  - Device listing with pagination and search capabilities
  - Real-time device status monitoring with visual indicators
  - Localized device model display (WATER_LEVEL_SENSOR, OTHER)
  - Complete device creation and editing forms
  - Geographic coordinate management for device positioning
  - Responsive design with mobile-friendly drawer interface
  - Internationalization support for multi-language environments

  Technical Implementation:
  - Vue 3 Composition API with TypeScript
  - Element Plus UI components for consistent design
  - Reactive state management with Vue's ref() and reactive()
  - Form validation with Element Plus validation rules
  - API integration with DeviceAPI for backend communication
  - Internationalization using vue-i18n

  @author System Administrator
  @version 1.0.0
  @since 2024-01-15
-->
<template>
  <!--
    Main application container with responsive layout
    Provides consistent spacing and structure for the entire component
  -->
  <div class="app-container">
    <!--
      Search and Filter Section
      Contains keyword search input and action buttons for device filtering
      Uses inline form layout for compact design
    -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <!--
          Keyword search field for device name, model, or serial number
          Supports real-time search with enter key trigger
        -->
        <el-form-item prop="keywords" :label="$t('device.keywords')">
          <el-input
            v-model="queryParams.keywords"
            :placeholder="$t('device.keywordsPlaceholder')"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <!-- Action buttons for search and reset operations -->
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

    <!--
      Device Data Table Container
      Displays device information in a structured table format
      Includes loading states, pagination, and action buttons
    -->
    <el-card shadow="hover" class="data-table">
      <!--
        Main data table with device information
        Features: loading state, row highlighting, border styling
      -->
      <el-table
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        class="data-table__content"
      >
        <!-- Device name column with minimum width constraint -->
        <el-table-column :label="$t('device.deviceName')" prop="deviceName" min-width="120" />

        <!--
          Device model column with localized display
          Converts technical values (WATER_LEVEL_SENSOR, OTHER) to user-friendly text
        -->
        <el-table-column
          :label="$t('device.deviceModel')"
          prop="deviceModel"
          width="120"
          align="center"
        >
          <template #default="scope">
            <span>{{ getDeviceModelText(scope.row.deviceModel) }}</span>
          </template>
        </el-table-column>

        <!-- Device ID column for unique identification -->
        <el-table-column
          :label="$t('device.deviceId')"
          prop="deviceId"
          width="140"
          align="center"
        />

        <!--
          Device status column with visual status indicators
          Uses Element Plus tags with color coding for different states
        -->
        <el-table-column :label="$t('device.status')" align="center" prop="status" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Device location with text overflow handling -->
        <el-table-column
          :label="$t('device.location')"
          prop="location"
          width="150"
          align="center"
          show-overflow-tooltip
        />

        <!-- Device creation timestamp -->
        <el-table-column
          :label="$t('device.createTime')"
          align="center"
          prop="createdAt"
          width="150"
        />

        <!--
          Operations column with action buttons
          Fixed positioning for consistent access to edit/delete functions
        -->
        <el-table-column :label="$t('device.operation')" fixed="right" width="220">
          <template #default="scope">
            <!-- Edit device button - opens device form in edit mode -->
            <el-button
              type="primary"
              icon="edit"
              link
              size="small"
              @click="handleEditClick(scope.row)"
            >
              {{ $t("device.edit") }}
            </el-button>

            <!-- Delete device button with confirmation dialog -->
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

      <!--
        Pagination component for data navigation
        Only displayed when there are records to paginate
        Synchronized with query parameters for seamless navigation
      -->
      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum!"
        v-model:limit="queryParams.pageSize!"
        @pagination="fetchData"
      />
    </el-card>

    <!--
      Device Form Drawer - Modal Interface for CRUD Operations

      A responsive drawer component that slides in from the right side
      Contains comprehensive form fields for device creation and editing
      Features dynamic sizing based on device type and validation rules
    -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <!--
        Device information form with comprehensive validation
        Uses Element Plus form components with reactive validation rules
        Supports both create and edit modes with conditional field display
      -->
      <el-form ref="deviceFormRef" :model="formData" :rules="rules" label-width="140px">
        <!-- Device name input - required field with validation -->
        <el-form-item :label="$t('device.deviceForm.deviceName')" prop="deviceName">
          <el-input
            v-model="formData.deviceName"
            :placeholder="$t('device.deviceForm.deviceNamePlaceholder')"
          />
        </el-form-item>

        <!--
          Device type selection dropdown
          Maps to deviceModel field with predefined options
          Localized labels for user-friendly selection
        -->
        <el-form-item :label="$t('device.deviceForm.deviceModel')" prop="deviceType">
          <el-select
            v-model="formData.deviceType"
            :placeholder="$t('device.deviceForm.deviceModelPlaceholder')"
          >
            <el-option :label="$t('device.waterLevelSensor')" value="WATER_LEVEL_SENSOR" />
            <el-option :label="$t('device.otherDevice')" value="OTHER" />
          </el-select>
        </el-form-item>

        <!--
          Device ID field - read-only in edit mode
          Only displayed when editing existing devices
          Provides unique identifier reference
        -->
        <el-form-item v-if="formData.deviceId" :label="$t('device.deviceId')" prop="deviceId">
          <el-input v-model="formData.deviceId" readonly :placeholder="$t('device.deviceId')" />
        </el-form-item>

        <!-- Device operational status selection -->
        <el-form-item :label="$t('device.deviceForm.status')" prop="status">
          <el-select
            v-model="formData.status"
            :placeholder="$t('device.deviceForm.statusPlaceholder')"
          >
            <el-option :label="$t('device.active')" value="ACTIVE" />
            <el-option :label="$t('device.inactive')" value="INACTIVE" />
          </el-select>
        </el-form-item>

        <!-- Device installation location input -->
        <el-form-item :label="$t('device.deviceForm.location')" prop="location">
          <el-input
            v-model="formData.location"
            :placeholder="$t('device.deviceForm.locationPlaceholder')"
          />
        </el-form-item>

        <!--
          Geographic coordinates section
          Two-column layout for latitude and longitude inputs
          High precision input with 6 decimal places for accurate positioning
        -->
        <el-row :gutter="16">
          <!-- Latitude coordinate input with validation -->
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

          <!-- Longitude coordinate input with validation -->
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

      <!--
        Drawer footer with action buttons
        Consistent button layout with cancel and confirm actions
        Loading state support for async operations
      -->
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

<script setup lang="ts">
/**
 * @fileoverview Device Management Component - Vue 3 Composition API Implementation
 * @description Comprehensive IoT device management interface with full CRUD operations
 *
 * This component implements a complete device management system featuring:
 * - Paginated device listing with advanced search capabilities
 * - Real-time device status monitoring and visualization
 * - Localized device model display with internationalization support
 * - Comprehensive device creation and editing forms
 * - Geographic coordinate management for spatial device positioning
 * - Responsive drawer interface with mobile optimization
 * - Form validation with reactive error handling
 * - API integration with robust error management
 *
 * Architecture:
 * - Vue 3 Composition API with TypeScript for type safety
 * - Reactive state management using Vue's ref() and reactive()
 * - Element Plus UI components for consistent design system
 * - Internationalization support via vue-i18n
 * - Modular function organization with clear separation of concerns
 *
  @author Chang Xiu-Wen, AI-Enhanced
  @since 2025-09-15
 */

import DeviceAPI from "@/api/iot/device-api";
import type { DeviceVO, DeviceQuery, DeviceForm } from "@/api/iot/device-api";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import { useAppStore } from "@/store/modules/app-store";
import type { FormInstance, FormRules } from "element-plus";

/**
 * Component Configuration
 * Defines component metadata and inheritance behavior
 * Disables attribute inheritance for cleaner component isolation
 */
defineOptions({
  name: "DeviceManagement",
  inheritAttrs: false,
});

/**
 * Extended Query Parameters Interface
 *
 * Extends the base DeviceQuery interface with pagination parameters
 * Enables seamless integration with backend pagination APIs
 * Supports flexible query parameter management for device filtering
 *
 * @interface DeviceQueryWithPagination
 * @extends {DeviceQuery}
 */
interface DeviceQueryWithPagination extends DeviceQuery {
  /** Current page number for pagination */
  pageNum?: number;
  /** Number of items per page */
  pageSize?: number;
}

/**
 * Core Vue Composables and Store Initialization
 *
 * Initializes essential Vue ecosystem dependencies:
 * - i18n: Internationalization composable for multi-language support
 * - appStore: Global application state management for responsive behavior
 */
const { t } = useI18n();
const appStore = useAppStore();

/**
 * Form and Component References
 *
 * Template refs for direct DOM manipulation and form control:
 * - queryFormRef: Reference to search form for validation and reset operations
 * - deviceFormRef: Reference to device form for validation and data management
 */
const queryFormRef = ref<FormInstance>();
const deviceFormRef = ref<FormInstance>();

/**
 * Reactive State Management
 *
 * Core reactive state variables for component functionality:
 * - loading: Controls table loading spinner during API operations
 * - total: Total number of devices for pagination calculations
 * - selectIds: Array of selected device IDs for bulk operations
 */
const loading = ref(false);
const total = ref(0);
const selectIds = ref<string[]>([]);

/**
 * Dialog State Management
 *
 * Reactive object managing modal/drawer state:
 * - visible: Controls drawer visibility
 * - title: Dynamic title based on operation mode (create/edit)
 * - loading: Loading state for async form submission
 */
const dialog = reactive({
  visible: false,
  title: "",
  loading: false,
});

/**
 * Device Form Data Model
 *
 * Reactive form data object containing all device properties:
 * Supports both creation and editing modes
 * Includes validation-compatible field structure
 * Geographic coordinates with high precision support
 */
const formData = reactive<DeviceForm>({
  deviceId: undefined,
  deviceName: "",
  deviceModel: "",
  deviceType: "WATER_LEVEL_SENSOR",
  deptId: 0,
  status: "ACTIVE",
  location: "",
  latitude: undefined,
  longitude: undefined,
});

/**
 * Query Parameters State
 *
 * Reactive query parameters for device filtering and pagination:
 * - pageNum: Current page in pagination
 * - pageSize: Items per page (default: 10)
 * - keywords: Search term for device name/model/serial filtering
 */
const queryParams = reactive<DeviceQueryWithPagination>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

/**
 * Device Data Store
 *
 * Reactive array storing paginated device data from API:
 * - Contains DeviceVO objects with complete device information
 * - Automatically updates table display when modified
 * - Supports real-time data synchronization
 */
const pageData = ref<DeviceVO[]>([]);

/**
 * Computed Properties Section
 * Reactive computed values that automatically update based on dependencies
 */

/**
 * Dynamic Drawer Size Computation
 *
 * Responsive drawer sizing based on device type:
 * - Desktop: Fixed width for optimal desktop experience
 * - Mobile: Percentage-based width for responsive mobile adaptation
 * - Ensures optimal user experience across all device types
 *
 * @returns {string} Computed drawer size value
 */
const drawerSize = computed(() => (appStore.device === "desktop" ? "600px" : "90%"));

/**
 * Form Validation Rules Configuration
 *
 * Comprehensive validation rules for device form fields:
 * - Reactive computation ensures translation updates
 * - Required field validation with localized error messages
 * - Trigger-based validation for optimal user experience
 * - Supports internationalization through vue-i18n integration
 *
 * @returns {FormRules} Computed validation rules object
 */
const rules = computed<FormRules>(() => ({
  deviceName: [
    {
      required: true,
      message: t("device.validation.deviceNameRequired"),
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
 * Data Fetching and Management Functions
 * Core functions for API communication and data synchronization
 */

/**
 * Fetch Device Data from API
 *
 * Retrieves paginated device data based on current query parameters
 * Implements robust error handling and loading state management
 * Supports multiple response formats for API compatibility
 *
 * Process Flow:
 * 1. Set loading state to true
 * 2. Execute API call with current query parameters
 * 3. Parse response data (handles array and object formats)
 * 4. Update reactive data stores
 * 5. Reset loading state
 *
 * @async
 * @function fetchData
 * @returns {Promise<void>} Promise that resolves when data fetch completes
 * @throws {Error} Propagates API errors for caller handling
 */
function fetchData() {
  loading.value = true;
  DeviceAPI.listDevices(queryParams)
    .then((data: any) => {
      // Handle different response formats for API compatibility
      if (Array.isArray(data)) {
        pageData.value = data;
        total.value = data.length;
      } else if (data && typeof data === "object") {
        pageData.value = data.list || data.data || [];
        total.value = data.total || data.count || 0;
      } else {
        pageData.value = [];
        total.value = 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

/**
 * Handle Search Query Execution
 *
 * Processes search form submission with optimized pagination reset
 * Ensures fresh data retrieval when search criteria change
 * Maintains consistent user experience with loading states
 *
 * @function handleQuery
 * @returns {void}
 */
function handleQuery() {
  queryParams.pageNum = 1;
  fetchData();
}

/**
 * Reset Query Form and Parameters
 *
 * Clears all search filters and form validation states
 * Resets pagination to first page for comprehensive data refresh
 * Provides clean slate for new search operations
 *
 * Process:
 * 1. Reset form fields to initial state
 * 2. Clear query parameters
 * 3. Reset pagination
 * 4. Trigger fresh data fetch
 *
 * @function handleResetQuery
 * @returns {void}
 */
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.keywords = "";
  fetchData();
}

/**
 * Utility Functions for Data Transformation
 * Helper functions for data formatting and localization
 */

/**
 * Get Status Tag Type for Element Plus Tags
 *
 * Maps device status values to appropriate Element Plus tag types
 * Provides visual status indicators with semantic color coding
 * Supports accessibility and user experience enhancement
 *
 * Color Mapping:
 * - ACTIVE: success (green) - indicates operational status
 * - INACTIVE: warning (yellow) - indicates maintenance/offline status
 * - Default: info (blue) - fallback for unknown states
 *
 * @function getStatusTagType
 * @param {string} status - Device status string value
 * @returns {("success" | "warning" | "danger" | "info" | "primary")} Element Plus tag type
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
 * Get Localized Status Text
 *
 * Converts technical status values to user-friendly localized text
 * Supports internationalization for multi-language environments
 * Provides consistent status representation across the application
 *
 * @function getStatusText
 * @param {string} status - Device status string value
 * @returns {string} Localized status text for display
 */
function getStatusText(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    default:
      return status;
  }
}

/**
 * Get Localized Device Model Text
 *
 * Transforms technical device model values into user-friendly display text
 * Implements internationalization support for device type representation
 * Ensures consistent device model display across different languages
 *
 * Supported Models:
 * - WATER_LEVEL_SENSOR: Maps to localized "Water Level Sensor"
 * - OTHER: Maps to localized "Other Device"
 * - Default: Returns original value for unknown models
 *
 * @function getDeviceModelText
 * @param {string} deviceModel - Technical device model identifier
 * @returns {string} Localized device model display text
 */
function getDeviceModelText(deviceModel: string): string {
  switch (deviceModel) {
    case "WATER_LEVEL_SENSOR":
      return t("device.waterLevelSensor");
    case "OTHER":
      return t("device.otherDevice");
    default:
      return deviceModel;
  }
}

/**
 * CRUD Operation Handlers
 * Functions managing create, read, update, and delete operations
 */

/**
 * Handle Edit Button Click in Table
 *
 * Initiates device editing workflow from table row action
 * Triggers dialog opening with pre-populated device data
 * Provides seamless transition to edit mode
 *
 * @function handleEditClick
 * @param {DeviceVO} row - Device data object from table row
 * @returns {void}
 */
function handleEditClick(row: DeviceVO) {
  console.log("Edit button clicked, deviceId:", row.deviceId);
  handleOpenDialog(row.deviceId);
}

/**
 * Handle Device Deletion
 *
 * Manages device deletion workflow with user confirmation
 * Supports both single and bulk deletion operations
 * Implements comprehensive error handling and user feedback
 *
 * Process Flow:
 * 1. Validate selection (single device or bulk selection)
 * 2. Display confirmation dialog with localized messages
 * 3. Execute deletion API call
 * 4. Provide success/error feedback
 * 5. Refresh data display
 *
 * @async
 * @function handleDelete
 * @param {string} [deviceId] - Optional specific device ID for single deletion
 * @returns {Promise<void>} Promise that resolves when deletion completes
 * @throws {Error} Handles user cancellation gracefully
 */
async function handleDelete(deviceId?: string) {
  const ids = deviceId ? [deviceId] : selectIds.value;
  if (ids.length === 0) {
    ElMessage.warning(t("device.selectDevicesToDelete"));
    return;
  }

  try {
    // Display confirmation dialog with localized messages
    await ElMessageBox.confirm(t("device.deleteConfirmation"), t("device.deleteTitle"), {
      confirmButtonText: t("common.confirm"),
      cancelButtonText: t("common.cancel"),
      type: "warning",
    });

    // Execute deletion operation
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
 * Handle Dialog Opening for Device Operations
 *
 * Manages modal dialog state and form data initialization
 * Supports both create and edit modes with appropriate data handling
 * Implements error handling for data loading operations
 *
 * Mode Handling:
 * - Edit Mode: Loads existing device data and populates form
 * - Create Mode: Initializes empty form with default values
 *
 * @async
 * @function handleOpenDialog
 * @param {string} [deviceId] - Optional device ID for edit mode
 * @returns {Promise<void>} Promise that resolves when dialog is ready
 */
async function handleOpenDialog(deviceId?: string) {
  dialog.visible = true;

  if (deviceId) {
    // Edit mode: Populate form with existing device data
    dialog.title = t("device.edit");
    try {
      // Find device in current page data (optimization to avoid extra API call)
      const device = pageData.value.find((d) => d.deviceId === deviceId);
      if (device) {
        Object.assign(formData, {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          deviceModel: device.deviceModel,
          deviceType: device.deviceType,
          deptId: device.deptId,
          status: device.status,
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
    dialog.title = t("device.add");
    resetForm();
  }
}

/**
 * Handle Dialog Closing
 *
 * Manages dialog closure with proper state cleanup
 * Resets form data and dialog state for next operation
 * Ensures clean state transition between operations
 *
 * @function handleCloseDialog
 * @returns {void}
 */
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * Reset Device Form to Initial State
 *
 * Clears all form fields and validation states
 * Prepares form for new data entry or editing
 * Ensures consistent form state across operations
 *
 * Reset Fields:
 * - deviceId: Cleared for new entries
 * - deviceName: Empty string
 * - deviceModel: Empty string
 * - deviceType: Default to WATER_LEVEL_SENSOR
 * - deptId: Reset to 0
 * - status: Default to ACTIVE
 * - location: Empty string
 * - latitude/longitude: Undefined
 *
 * @function resetForm
 * @returns {void}
 */
function resetForm() {
  Object.assign(formData, {
    deviceId: undefined,
    deviceName: "",
    deviceModel: "",
    deviceType: "WATER_LEVEL_SENSOR",
    deptId: 0,
    status: "ACTIVE",
    location: "",
    latitude: undefined,
    longitude: undefined,
  });
  deviceFormRef.value?.resetFields();
}

/**
 * Handle Form Submission for Device Operations
 *
 * Processes device creation and update operations with validation
 * Implements comprehensive error handling and user feedback
 * Manages loading states and form state transitions
 *
 * Process Flow:
 * 1. Validate form data using Element Plus validation
 * 2. Set loading state for user feedback
 * 3. Determine operation type (create vs update)
 * 4. Execute appropriate API call
 * 5. Handle success/error responses
 * 6. Update UI state and refresh data
 *
 * @async
 * @function handleSubmit
 * @returns {Promise<void>} Promise that resolves when submission completes
 */
async function handleSubmit() {
  if (!deviceFormRef.value) return;

  try {
    // Validate form before submission
    const valid = await deviceFormRef.value.validate();
    if (!valid) return;

    dialog.loading = true;

    if (formData.deviceId) {
      // Update existing device
      await DeviceAPI.updateDevice(formData.deviceId, formData);
      ElMessage.success(t("device.updateSuccess"));
    } else {
      // Create new device
      await DeviceAPI.addDevice(formData);
      ElMessage.success(t("device.addSuccess"));
    }

    // Close dialog and refresh data
    handleCloseDialog();
    fetchData();
  } catch (error) {
    console.error("Error saving device:", error);
    ElMessage.error(t("device.saveError"));
  } finally {
    dialog.loading = false;
  }
}

/**
 * Lifecycle Hooks
 * Vue component lifecycle management
 */

/**
 * Component Mount Hook
 *
 * Initializes component with data fetching
 * Ensures data is loaded when component becomes active
 * Triggers initial data population for user interface
 */
onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
/**
 * Device Management Component Styles
 *
 * Comprehensive SCSS styling for the device management interface
 * Implements responsive design patterns and consistent visual hierarchy
 * Uses CSS custom properties for theme integration and maintainability
 */

/**
 * Main Application Container
 *
 * Root container providing consistent spacing and layout foundation
 * Ensures proper content padding across different screen sizes
 * Creates visual separation from page boundaries
 */
.app-container {
  padding: 20px;
}

/**
 * Search Container Styling
 *
 * Container for search and filter controls
 * Provides visual grouping and background contrast
 * Implements rounded corners for modern UI aesthetics
 * Ensures proper spacing for form elements
 */
.search-container {
  padding: 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;

  /**
   * Search Buttons Layout
   *
   * Right-aligns action buttons in the search form
   * Provides consistent spacing and visual hierarchy
   * Ensures buttons don't interfere with form layout
   */
  .search-buttons {
    margin-left: auto;
  }
}

/**
 * Data Table Container
 *
 * Wrapper for the device data table with card-based design
 * Applies shadow effects for depth and visual separation
 * Ensures table content has proper spacing and alignment
 */
.data-table {
  /**
   * Table Content Styling
   *
   * Ensures table occupies full container width
   * Provides consistent table layout and responsiveness
   * Maintains proper column alignment and spacing
   */
  &__content {
    width: 100%;
  }
}

/**
 * Drawer Footer Styling
 *
 * Consistent button layout for modal drawer footer
 * Implements flexbox for proper button alignment
 * Provides adequate spacing between action buttons
 * Ensures consistent footer appearance across different contexts
 */
.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>
