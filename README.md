# AntesDePicar

### Think before you click. Verify before you trust.

**AntesDePicar** is an open-source AI-powered web application designed to help people identify potential digital scams and understand suspicious messages before taking action.

The platform analyzes messages that may come from banks, delivery companies, employers, government institutions, or unknown senders. It identifies possible warning signs, explains why they may be risky, and provides practical recommendations to help users verify information safely.

Our goal is not simply to label a message as fraudulent or legitimate, but to help people understand potential risks and make safer digital decisions.

---

## The Problem

Digital scams are increasingly common. Many people receive deceptive messages through WhatsApp, SMS, email, and social media.

These messages may attempt to:
- Steal personal or financial information.
- Obtain passwords or verification codes.
- Trick people into making payments.
- Redirect users to suspicious websites.
- Take advantage of fear, urgency, or attractive offers.

Not everyone knows how to recognize these warning signs. AntesDePicar aims to make digital security easier to understand and accessible to everyone.

## Our Solution

AntesDePicar uses artificial intelligence to analyze suspicious messages and provide understandable explanations.

Instead of simply saying "This is a scam", the application aims to show:

- **Risk assessment:** An estimated level of risk.
- **Warning signs:** Suspicious expressions or requests found in the message.
- **Evidence:** Specific parts of the message that triggered warnings.
- **Explanation:** Why those elements may represent a risk.
- **Recommendations:** Practical steps to verify the information safely.
- **Limitations:** What the system could not independently confirm.

The analysis is intended as guidance, not as definitive proof of fraud.

## Main Features

The first version is planned to include:

- Text analysis for suspicious messages.
- AI-powered risk assessment.
- Identification of potential scam indicators.
- Evidence-based explanations.
- Practical security recommendations.
- Example messages for testing.
- A simple and responsive user interface.
- Spanish-language support.

## Artificial Intelligence and Open Innovation

AntesDePicar is being developed around open-weight artificial intelligence models.

We want to explore how open AI can make digital protection tools more accessible, adaptable, and transparent.

Using open-weight models can help us:
- Experiment with different AI models.
- Adapt prompts and analysis processes.
- Reduce dependence on a single AI provider.
- Explore privacy-conscious deployment options.
- Allow developers to inspect and improve the project.

The current model is Qwen 2.5 (`qwen2.5:3b`), run locally with Ollama. Check its license terms before any use beyond research or evaluation.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| JavaScript | Application development |
| Vite | Frontend development environment |
| Python & FastAPI | REST API |
| PostgreSQL | Accounts, analysis history and community reports |
| SQLAlchemy & Alembic | Data models and migrations |
| Open-weight AI model | Suspicious message analysis |
| Git & GitHub | Version control and collaboration |

## Privacy and Security

User safety is a priority.

The project aims to follow these principles:

- Store analyzed messages only for signed-in users, in their private history. Guest analyses are not stored in the database.
- Store passwords only as Argon2id hashes.
- Protect API credentials using environment variables.
- Never expose private API keys in frontend code.
- Avoid logging sensitive message content.
- Warn users not to share passwords, verification codes, or banking information.
- Clearly communicate that AI results may contain errors.

## Project Goals

Our goals are to:

1. Help people recognize possible digital scams.
2. Explain suspicious messages in simple language.
3. Encourage safer online habits.
4. Explore practical applications of open-source AI.
5. Build an accessible tool that can be improved by the developer community.

##  Project Status

**Currently in development.**

We are working on the first functional version, focusing on text analysis, risk explanations, and security recommendations.

Some features described in this README are planned and may not yet be available.

##  Future Improvements

Potential future features include:

- Screenshot and image analysis.
- Suspicious link inspection.
- Verification through official information sources.
- More types of scam detection.
- Additional language support.
- Educational resources about digital security.

## Development Team

Developed by a team of Computer Systems Engineering students:

1. **Daniela Olivera López**
2. **Eduardo Manuel Martínez López**
3. **Kelly Adanari Cruz Alonso**
4. **Fredy Azarel Gómez Vásquez**

## Open Source

We believe technology and digital protection should be accessible to everyone.

Contributions, suggestions, and improvements from the developer community are welcome.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**AntesDePicar — Think before you click. Verify before you trust.** 
