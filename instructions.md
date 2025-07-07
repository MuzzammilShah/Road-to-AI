## Overview

Installation process to setup and run this documenatation project locally.

## MacOS

### Virtual Environment Setup

```
cd Road-to-AI
python -m venv venv
source venv/bin/activate
```

### MkDocs-Only Dependencies

```
pip install --upgrade pip

# Core documentation packages
pip install mkdocs mkdocs-material mkdocs-jupyter

# Markdown extensions (required by your mkdocs.yml)
pip install pymdown-extensions
```

### All-in-One Installation

```
pip install mkdocs mkdocs-material mkdocs-jupyter pymdown-extensions
```

### Run and Test

```
mkdocs serve
```