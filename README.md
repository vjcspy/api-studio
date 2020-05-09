# API Studio

  ### Yarn packages

  Sử dụng yarn packages để chia nhỏ ra nhiều component, ví dụ như:
  - g-app: main module
  - g-base: main component
  - g-sap: connect đến database lưu trữ dữ liệu của SAP export ra và expose api

Để tạo mới một component

  ```bash
$ cd packages
$ lb4 extension COMPONENT_NAME
```

Để hiểu được component làm những gì thì xem doc phần [component](https://github.com/vjcspy/api-studio/blob/master/docs/modules/component.md)

 ### Dev

Project sẽ tự compile và restart lại  khi có sự thay đổi. Đã được optimize để sử dụng với debuger(zero config)
  ```bash
$ yarn dev
```
