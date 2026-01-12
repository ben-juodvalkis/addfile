# Contributing to live-file-loader

Thank you for your interest in contributing to live-file-loader!

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test thoroughly in Max/Live
6. Commit with clear messages
7. Push and create a Pull Request

## Development Setup

### Requirements

- Max 8.5 or later
- Ableton Live 11 or 12
- Node.js (for testing outside Max)
- Git

### Project Structure

```
live-file-loader/
├── code/               # Node.js scripts
├── patchers/           # Max abstractions
├── examples/           # Example patches
├── help/               # Help patches
├── docs/               # Documentation
├── tests/              # Test suite
└── media/              # Icons and images
```

## Code Style

### JavaScript

- Use ES6+ features
- Use async/await for asynchronous code
- Add JSDoc comments for functions
- Keep functions focused and small
- Handle errors gracefully

### Max Patches

- Use clear, readable layouts
- Add comments for complex logic
- Use consistent color coding
- Include inlet/outlet descriptions

## Pull Request Guidelines

1. **One feature per PR** - Keep changes focused
2. **Update documentation** - If you add/change features
3. **Add tests** - For new functionality
4. **Follow existing patterns** - Consistency is key
5. **Write good commit messages** - Explain why, not just what

## Commit Message Format

```
<type>: <short description>

<optional body>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Testing

Before submitting:

1. Test all affected commands
2. Test on both Mac and Windows if possible
3. Test in Live 11 and Live 12 if possible
4. Run through the test-suite.maxpat
5. Verify no console errors

## Reporting Issues

When reporting bugs, include:

- Max version
- Live version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Console output if applicable

## Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Describe the use case
- Explain why it would be useful
- Consider if you could implement it

## Questions?

Open a GitHub Discussion or Issue for questions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
