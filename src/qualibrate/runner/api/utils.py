from pydantic import BaseModel

next_line = "\n"


def get_model_docstring(model: type[BaseModel]) -> str:
    return f"""
**Model**: {model.__name__}

{model.__doc__}

**Fields**:
```
{
        next_line.join(
            f"{name}: {info.description}"
            for name, info in model.model_fields.items()
        )
    }
```
"""
