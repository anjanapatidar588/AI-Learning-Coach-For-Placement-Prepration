import Topic from '../models/Topic.js';
import { generateAIResponse } from '../services/ai/geminiClient.js';
import { PERSONA_PROMPTS } from '../services/ai/promptTemplates.js';

export const getCSCoreSubjects = async (req, res) => {
  try {
    const subjects = [
      { id: 'dbms', name: 'Database Management Systems (DBMS)', icon: 'database', topicsCount: 12, mastery: 65, description: 'Relational model, SQL, B-Trees, Indexing, ACID, Normalization' },
      { id: 'os', name: 'Operating Systems (OS)', icon: 'cpu', topicsCount: 10, mastery: 50, description: 'Process management, threads, deadlock, virtual memory, paging' },
      { id: 'cn', name: 'Computer Networks (CN)', icon: 'wifi', topicsCount: 9, mastery: 55, description: 'OSI 7 layers, TCP/IP, HTTP/HTTPS, DNS, Subnetting' },
      { id: 'oops', name: 'Object-Oriented Programming (OOP)', icon: 'box', topicsCount: 8, mastery: 70, description: 'Encapsulation, Polymorphism, Abstraction, Inheritance, Design Patterns' }
    ];

    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCSCoreTopicDetail = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const topicData = {
      subjectId,
      title: subjectId === 'dbms' ? 'Transactions & ACID Properties' : 'Process Synchronization & Semaphores',
      contentMarkdown: subjectId === 'dbms'
        ? `### Database Transactions & ACID Properties

A transaction is a logical unit of database processing that includes one or more database access operations.

#### 1. Atomicity ("All or Nothing")
Either all operations of the transaction are executed successfully or none are. If a failure occurs mid-way, the transaction is rolled back.

#### 2. Consistency
The database must transition from one valid state to another valid state, maintaining all integrity constraints.

#### 3. Isolation
Concurrently executing transactions must execute independently without interfering with each other.

#### 4. Durability
Once a transaction commits, its updates persist permanently in non-volatile storage, even during system crashes.`
        : `### Process Synchronization & Deadlocks

#### What is a Race Condition?
A race condition occurs when two or more processes access shared data concurrently and the final outcome depends on the execution order.

#### Critical Section Problem Requirements:
1. **Mutual Exclusion**: Only one process at a time can execute in its critical section.
2. **Progress**: Selection of next process cannot be postponed indefinitely.
3. **Bounded Waiting**: Bound on the number of times other processes are allowed to enter their critical section after a request has been made.`,
      flashcards: [
        { front: 'What is a B+ Tree leaf node linked list used for?', back: 'Fast sequential and range queries without traversing parent nodes.' },
        { front: 'What is Dirty Read?', back: 'Reading uncommitted data written by another concurrent transaction.' }
      ]
    };

    res.json({ success: true, data: topicData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCSCoreAIConcept = async (req, res) => {
  try {
    const { conceptTitle } = req.body;
    const response = await generateAIResponse({
      persona: 'CS Core Mentor',
      systemPrompt: PERSONA_PROMPTS['CS Core Mentor'],
      userPrompt: `Explain the CS Core concept "${conceptTitle}" with clear diagrams or bullet points and real-world software engineering analogies.`,
      contextData: { conceptTitle }
    });

    res.json({ success: true, explanation: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
