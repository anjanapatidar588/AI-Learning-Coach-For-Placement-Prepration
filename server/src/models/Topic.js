import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  problemStatement: { type: String, default: '' },
  explanation: { type: String, default: '' },
  code: { type: String, default: '' },
  input: { type: String, default: '' },
  output: { type: String, default: '' },
  steps: [{
    stepNumber: { type: Number },
    label: { type: String },
    explanation: { type: String },
    state: { type: mongoose.Schema.Types.Mixed },
    output: { type: String }
  }]
}, { _id: false });

const visualDiagramSchema = new mongoose.Schema({
  type: { type: String, enum: ['flow', 'network', 'class', 'database', 'architecture', 'custom'], default: 'flow' },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  nodes: [{
    id: { type: String },
    label: { type: String },
    type: { type: String },
    details: { type: String }
  }],
  edges: [{
    from: { type: String },
    to: { type: String },
    label: { type: String }
  }]
}, { _id: false });

const formulaSchema = new mongoose.Schema({
  expression: { type: String, default: '' },
  explanation: { type: String, default: '' },
  variables: [{
    name: { type: String },
    description: { type: String }
  }]
}, { _id: false });

const shortcutSchema = new mongoose.Schema({
  tip: { type: String, default: '' },
  formula: { type: String, default: '' },
  example: { type: String, default: '' }
}, { _id: false });

const sqlExampleSchema = new mongoose.Schema({
  query: { type: String, default: '' },
  sampleData: { type: String, default: '' },
  expectedResult: { type: String, default: '' },
  explanation: { type: String, default: '' }
}, { _id: false });

const learningContentSchema = new mongoose.Schema({
  learningObjectives: [{ type: String }],
  conceptExplanation: { type: String, default: '' },
  what: { type: String, default: '' },
  why: { type: String, default: '' },
  whereWhen: { type: String, default: '' },
  examples: [exampleSchema],
  edgeCases: [{ type: String }],
  visualDiagram: visualDiagramSchema,
  syntaxCode: {
    cpp: { type: String, default: '' },
    java: { type: String, default: '' },
    python: { type: String, default: '' },
    javascript: { type: String, default: '' },
    sql: { type: String, default: '' }
  },
  formula: formulaSchema,
  shortcut: shortcutSchema,
  sqlExample: sqlExampleSchema,
  practiceQuestionReferences: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  estimatedLearningTimeMinutes: { type: Number, default: 30 }
}, { _id: false });

const topicSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['dsa', 'aptitude', 'cs_core'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  order: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  summary: { type: String, default: '' },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
  }],
  description: { type: String, default: '' },
  learningContent: {
    type: learningContentSchema,
    default: () => ({})
  }
}, { timestamps: true });

export default mongoose.model('Topic', topicSchema);
