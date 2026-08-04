---
name: unity-assembly-architecture
description: >-
  Use for asmdef architecture: assembly graph, cycles, execution order,
  scripting defines, and which assembly owns a script path.
---
# Assembly architecture

## Discovery

1. `list_assemblies` / `get_assembly_dependency_graph`
2. `detect_assembly_cycles`
3. `get_assembly_for_path` / `list_scripts_by_assembly`
4. `list_asmdef_references` — reverse dependents
5. `get_script_execution_order` / `get_scripting_defines`

## Checklist

- Runtime vs Editor assemblies split cleanly.
- No cycles; prefer facades over god assemblies.
- Defines documented per platform (`get_scripting_defines`).
- Tests in dedicated asmdefs (`list_test_assemblies`).

## Prompts

- *"Do we have assembly cycles?"*
- *"Which assembly contains Assets/Scripts/Player.cs?"*
