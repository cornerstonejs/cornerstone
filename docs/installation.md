---
description: Cornerstone installation guide - How to use Cornerstone in your project.
---

# Installation

### Direct Download / CDN
[https://unpkg.com/cornerstone-core](https://unpkg.com/cornerstone-core)

<!--email_off-->
[Unpkg.com](https://unpkg.com) provides NPM-based CDN links. The above link will always point to the latest release on NPM. You can also use a specific version/tag via URLs like `https://unpkg.com/cornerstone-core@2.0.0`.
<!--/email_off-->

``` html
<script src="/path/to/cornerstone.js"></script>
```

### NPM

``` bash
npm install cornerstone-core --save
```

When used with a module system, you can import `cornerstone` like this:

``` js
import * as cornerstone from 'cornerstone-core'
```

You don't need to do this when using global script tags.

### Dev Build

You will have to clone directly from GitHub and build `cornerstone` yourself if you want to use the latest dev build.

``` bash
git clone https://github.com/cornerstonejs/cornerstone.git node_modules/cornerstone
cd node_modules/cornerstone
npm install
npm run build
```
