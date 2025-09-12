# Community Water Level IoT Frontend

## Project Overview

This project is a web frontend application for the Community Water Level IoT system, built for a competition.

## Attribution and License

**Important**: This project is a modified version of the open-source admin dashboard template [vue3-element-admin](https://github.com/youlaitech/vue3-element-admin).

- **Original Repository**: <https://github.com/youlaitech/vue3-element-admin.git>
- **Original License**: MIT License
- **Original Author**: youlaitech

We have used vue3-element-admin as a foundation and have made significant customizations and additions for our specific use case. All future commits will detail the specific changes and features we've added beyond the original template.

## Key Modifications Made

1. **Internationalization (i18n) Enhancements**:
   - Enhanced Chinese Traditional (zh-tw) and English (en) translations
   - Fixed internationalization bugs where Chinese labels weren't switching to English
   - Comprehensive translation coverage for system management modules:
     - User Management
     - Role Management
     - Notice Management
     - Menu Management

2. **UI/UX Improvements**:
   - Updated logo and branding
   - Enhanced theme switching functionality
   - Improved responsive design elements

3. **System Management Features**:
   - Enhanced user management with improved validation
   - Advanced role permission management
   - Comprehensive menu management with route configuration
   - Notice management system

## Technology Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **UI Library**: Element Plus
- **Build Tool**: Vite
- **Internationalization**: vue-i18n
- **State Management**: Pinia
- **Routing**: Vue Router

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

This project maintains the MIT License from the original vue3-element-admin template. See the `licenses/` directory for full license information.

## Acknowledgments

Special thanks to the [youlaitech](https://github.com/youlaitech) team for creating and maintaining the excellent vue3-element-admin template that serves as the foundation for this project.
