import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Topic from '../src/models/Topic.js';
import Question from '../src/models/Question.js';

export const seedRepresentativeTopics = async () => {
  console.log('[SeedLearningContent] Seeding representative topics for Step 4 Guided Learning Experience...');

  // 1. DSA Topic: Binary Search
  const dsaTopic = await Topic.findOneAndUpdate(
    { slug: 'binary-search-foundations' },
    {
      title: 'Binary Search & Pattern Analysis',
      slug: 'binary-search-foundations',
      category: 'dsa',
      subject: 'Algorithms',
      difficulty: 'Medium',
      summary: 'Master divide-and-conquer binary search on sorted arrays and answer spaces.',
      description: 'Comprehensive guide to binary search, range boundaries, mid-calculation overflow, and search space reduction.',
      learningContent: {
        learningObjectives: [
          'Master logarithmic search space reduction O(log N)',
          'Avoid mid-pointer integer overflow vulnerabilities',
          'Identify monotonic search spaces in advanced problems',
          'Implement lower bound and upper bound binary search patterns'
        ],
        what: 'Binary Search is an efficient search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
        why: 'Reduces time complexity from O(N) linear scan to logarithmic O(log N). Highly crucial for coding assessments and technical interviews.',
        whereWhen: 'Used when dealing with sorted arrays, search space range optimization (Binary Search on Answer), and monotonic functions.',
        conceptExplanation: `Binary search works on sorted arrays. By comparing the middle element of the array with the target value, we can eliminate half of the array at each step:
- If target == mid: return index
- If target < mid: narrow search to the left half (high = mid - 1)
- If target > mid: narrow search to the right half (low = mid + 1)

Always calculate mid using: \`mid = low + Math.floor((high - low) / 2)\` to prevent integer overflow.`,
        syntaxCode: {
          javascript: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor(low + (high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
          python: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
          cpp: `int binarySearch(vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
          java: `public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
        },
        examples: [{
          title: 'Search in Sorted Array',
          problemStatement: 'Given sorted array [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] and target = 23, find index.',
          explanation: 'Target 23 is compared against mid-points iteratively.',
          input: 'arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23',
          output: '5',
          steps: [
            { stepNumber: 1, label: 'Initial Range', explanation: 'low = 0 (2), high = 9 (91). mid = 4 (16). 16 < 23, move low to mid+1 = 5.', state: { array: [2,5,8,12,16,23,38,56,72,91], pointers: { low: 0, high: 9, mid: 4 }, variables: { midVal: 16, target: 23 } }, output: 'Move Right' },
            { stepNumber: 2, label: 'Second Step', explanation: 'low = 5 (23), high = 9 (91). mid = 7 (56). 56 > 23, move high to mid-1 = 6.', state: { array: [2,5,8,12,16,23,38,56,72,91], pointers: { low: 5, high: 9, mid: 7 }, variables: { midVal: 56, target: 23 } }, output: 'Move Left' },
            { stepNumber: 3, label: 'Third Step', explanation: 'low = 5 (23), high = 6 (38). mid = 5 (23). arr[mid] == target! Target found at index 5.', state: { array: [2,5,8,12,16,23,38,56,72,91], pointers: { low: 5, high: 6, mid: 5 }, variables: { midVal: 23, target: 23 } }, output: 'Target Found at Index 5' }
          ]
        }],
        edgeCases: [
          'Target smaller than first element or larger than last element',
          'Single element array [X] where X == target or X != target',
          'Duplicate elements when finding first/last occurrence',
          'Large array length causing (low + high) overflow if written as (low+high)/2'
        ],
        visualDiagram: {
          type: 'flow',
          title: 'Binary Search Decision Matrix',
          content: 'Divide and conquer decision flow.',
          nodes: [
            { id: 'n1', label: 'Array & Target Input', type: 'start', details: 'Sorted array [A0 ... An]' },
            { id: 'n2', label: 'Compute mid = low + (high-low)/2', type: 'process', details: 'Find mid-point' },
            { id: 'n3', label: 'arr[mid] == Target?', type: 'decision', details: 'Match test' },
            { id: 'n4', label: 'Return mid index', type: 'end', details: 'Match found!' },
            { id: 'n5', label: 'arr[mid] < Target?', type: 'decision', details: 'Direction test' },
            { id: 'n6', label: 'Set low = mid + 1', type: 'process', details: 'Search right half' },
            { id: 'n7', label: 'Set high = mid - 1', type: 'process', details: 'Search left half' }
          ],
          edges: [
            { from: 'n1', to: 'n2', label: 'Start' },
            { from: 'n2', to: 'n3', label: 'Check' },
            { from: 'n3', to: 'n4', label: 'Yes' },
            { from: 'n3', to: 'n5', label: 'No' },
            { from: 'n5', to: 'n6', label: 'Yes' },
            { from: 'n5', to: 'n7', label: 'No' },
            { from: 'n6', to: 'n2', label: 'Loop' },
            { from: 'n7', to: 'n2', label: 'Loop' }
          ]
        },
        estimatedLearningTimeMinutes: 35
      }
    },
    { upsert: true, new: true }
  );

  // 2. DBMS Topic: SQL Joins
  const dbmsTopic = await Topic.findOneAndUpdate(
    { slug: 'sql-joins-relational-databases' },
    {
      title: 'SQL Joins & Relational Algebra',
      slug: 'sql-joins-relational-databases',
      category: 'cs_core',
      subject: 'DBMS',
      difficulty: 'Medium',
      summary: 'Master INNER, LEFT, RIGHT, and FULL OUTER joins for relational queries.',
      description: 'In-depth guide to joining relational tables, ON vs WHERE clauses, Cartesian products, and performance indexing.',
      learningContent: {
        learningObjectives: [
          'Differentiate between INNER, LEFT, RIGHT, and FULL OUTER JOINs',
          'Understand Venn diagram set algebra for relational data',
          'Optimize join conditions using indexed primary & foreign keys',
          'Handle NULL values in outer joins effectively'
        ],
        what: 'A JOIN clause in SQL combines rows from two or more tables based on a related column between them (Primary Key <-> Foreign Key).',
        why: 'Relational databases store normalized data across separate tables. Joins allow retrieving consolidated reports and data queries efficiently.',
        whereWhen: 'Used extensively in enterprise database reporting, API query engines, and analytics data pipelines.',
        conceptExplanation: `SQL Join Types:
- INNER JOIN: Returns records that have matching values in both tables.
- LEFT (OUTER) JOIN: Returns all records from the left table, and matching records from the right table.
- RIGHT (OUTER) JOIN: Returns all records from the right table, and matching records from the left table.
- FULL (OUTER) JOIN: Returns all records when there is a match in either left or right table.`,
        syntaxCode: {
          sql: `-- INNER JOIN Syntax
SELECT Employees.name, Departments.dept_name
FROM Employees
INNER JOIN Departments ON Employees.dept_id = Departments.id;

-- LEFT JOIN Syntax
SELECT Employees.name, Orders.order_date
FROM Employees
LEFT JOIN Orders ON Employees.id = Orders.emp_id;`
        },
        sqlExample: {
          query: `SELECT Students.name, Courses.course_name\nFROM Students\nLEFT JOIN Courses ON Students.course_id = Courses.id;`,
          sampleData: `Students: [{ id: 1, name: 'Alice', course_id: 101 }, { id: 2, name: 'Bob', course_id: null }]\nCourses: [{ id: 101, course_name: 'Database Systems' }]`,
          expectedResult: `| name | course_name |\n| Alice | Database Systems |\n| Bob | NULL |`,
          explanation: 'LEFT JOIN keeps Bob even though course_id is NULL.'
        },
        edgeCases: [
          'Missing Foreign Key indexes leading to full table scan',
          'Combining Cartesian product (CROSS JOIN) without ON condition causing memory explosion',
          'Filtering LEFT JOIN right-table fields in WHERE clause implicitly turning it into INNER JOIN'
        ],
        visualDiagram: {
          type: 'database',
          title: 'Relational Join Architecture',
          content: 'Set diagram and table matching visualizer.',
          nodes: [
            { id: 'n1', label: 'Table A (Left Table)', type: 'source', details: 'Primary entity records (e.g. Students).' },
            { id: 'n2', label: 'Join Condition (ON A.key = B.key)', type: 'process', details: 'Matching engine.' },
            { id: 'n3', label: 'Table B (Right Table)', type: 'source', details: 'Related entity records (e.g. Courses).' },
            { id: 'n4', label: 'Merged Result Set', type: 'output', details: 'Consolidated row data.' }
          ],
          edges: [
            { from: 'n1', to: 'n2', label: 'Left Rows' },
            { from: 'n3', to: 'n2', label: 'Right Rows' },
            { from: 'n2', to: 'n4', label: 'Filtered Result' }
          ]
        },
        estimatedLearningTimeMinutes: 30
      }
    },
    { upsert: true, new: true }
  );

  // 3. Aptitude Topic: Time and Work
  const aptTopic = await Topic.findOneAndUpdate(
    { slug: 'time-and-work-aptitude' },
    {
      title: 'Time & Work Short-Tricks & Efficiency',
      slug: 'time-and-work-aptitude',
      category: 'aptitude',
      subject: 'Quantitative Aptitude',
      difficulty: 'Medium',
      summary: 'Solve Time, Work, and Pipe & Cistern problems in under 60 seconds.',
      description: 'Master LCM efficiency methods, unit work calculations, alternate day work patterns, and worker substitution.',
      learningContent: {
        learningObjectives: [
          'Master Total Work = LCM of individual times formula',
          'Calculate worker efficiency per day/hour',
          'Solve pipe filling & draining problems using negative efficiency',
          'Apply shortcut formulas for team & alternate day problems'
        ],
        what: 'Time and Work questions measure the time taken by individuals or groups of workers operating at different efficiencies to complete a task.',
        why: 'High-frequency question pattern in campus placement aptitude rounds, general ability exams, and screening tests.',
        whereWhen: 'Appears in online assessment tests for Amazon, TCS, Infosys, Wipro, and Accenture.',
        conceptExplanation: `Core Principles:
1. Work = Rate (Efficiency) × Time
2. If A completes work in X days, A's 1-day work = 1 / X.
3. LCM Method (Fastest):
   - Total Work = LCM of times
   - Efficiency of A = Total Work / X
   - Combined Efficiency = Eff(A) + Eff(B)
   - Total Time = Total Work / Combined Efficiency`,
        formula: {
          expression: 'Total Time = LCM(Time_A, Time_B) / (Eff_A + Eff_B)',
          explanation: 'Using LCM avoids fraction calculations.',
          variables: [
            { name: 'Time_A', description: 'Days taken by worker A alone' },
            { name: 'Time_B', description: 'Days taken by worker B alone' },
            { name: 'Eff_A', description: 'Units of work completed by A per day' }
          ]
        },
        shortcut: {
          tip: 'When A takes X days and B takes Y days, together they take (X * Y) / (X + Y) days.',
          formula: 'T_together = (X * Y) / (X + Y)',
          example: 'A takes 10 days, B takes 15 days. T = (10 * 15) / (10 + 15) = 150 / 25 = 6 days.'
        },
        examples: [{
          title: 'Combined Work Calculation',
          problemStatement: 'A can complete a project in 12 days. B can complete the same project in 24 days. Working together, how many days will they take?',
          explanation: 'LCM of 12 and 24 is 24. Total Work = 24 units. A efficiency = 2 units/day. B efficiency = 1 unit/day. Total efficiency = 3 units/day. Time = 24 / 3 = 8 days.',
          input: 'A = 12 days, B = 24 days',
          output: '8 days'
        }],
        edgeCases: [
          'Negative efficiency (draining pipes / destructive work)',
          'Workers leaving midway before completion',
          'Alternate day working patterns requiring cycle counting'
        ],
        visualDiagram: {
          type: 'flow',
          title: 'LCM Work Calculation Steps',
          content: 'Fast mental computation strategy.',
          nodes: [
            { id: 'n1', label: 'Given Individual Times (X, Y)', type: 'start', details: 'A=12, B=24' },
            { id: 'n2', label: 'Calculate Total Work = LCM(12, 24) = 24 units', type: 'process', details: 'Set baseline work' },
            { id: 'n3', label: 'Find Efficiencies: A=2, B=1', type: 'process', details: 'Unit rate per day' },
            { id: 'n4', label: 'Combined Rate = 2 + 1 = 3 units/day', type: 'process', details: 'Add rates' },
            { id: 'n5', label: 'Time = 24 / 3 = 8 Days', type: 'end', details: 'Final answer!' }
          ],
          edges: [
            { from: 'n1', to: 'n2', label: 'LCM' },
            { from: 'n2', to: 'n3', label: 'Divide' },
            { from: 'n3', to: 'n4', label: 'Sum' },
            { from: 'n4', to: 'n5', label: 'Result' }
          ]
        },
        estimatedLearningTimeMinutes: 25
      }
    },
    { upsert: true, new: true }
  );

  // 4. OOPS Topic: Inheritance & Polymorphism
  const oopsTopic = await Topic.findOneAndUpdate(
    { slug: 'oops-inheritance-polymorphism' },
    {
      title: 'Inheritance & Dynamic Polymorphism',
      slug: 'oops-inheritance-polymorphism',
      category: 'cs_core',
      subject: 'OOPS',
      difficulty: 'Medium',
      summary: 'Master Object-Oriented Principles, VTables, and Runtime Method Overriding.',
      description: 'Detailed analysis of code reusability, method overriding vs overloading, virtual functions, and VTable pointers.',
      learningContent: {
        learningObjectives: [
          'Implement Single, Multilevel, and Multiple Inheritance structures',
          'Understand compile-time overloading vs runtime overriding',
          'Analyze Virtual Tables (vtable) & VPointer execution mechanics',
          'Avoid the Diamond Problem using virtual base classes'
        ],
        what: 'Inheritance allows a child class to inherit properties & methods from a parent class. Polymorphism allows methods to execute different logic based on object dynamic type.',
        why: 'Fundamental to clean software engineering, API development, and object-oriented placement questions.',
        whereWhen: 'Used everywhere in modern software engineering frameworks (Java Spring, C++, Python OOP, Android SDK).',
        conceptExplanation: `Key Concepts:
- Method Overloading (Compile-time): Same function name, different parameter lists.
- Method Overriding (Runtime): Subclass provides specific implementation of a superclass method.
- Virtual Functions: Functions expected to be overridden in derived classes, resolved at runtime using VTables.`,
        syntaxCode: {
          java: `class Vehicle {
    void start() { System.out.println("Vehicle starting..."); }
}
class Car extends Vehicle {
    @Override
    void start() { System.out.println("Car engine roaring!"); }
}`,
          cpp: `class Vehicle {
public:
    virtual void start() { cout << "Vehicle starting...\n"; }
};
class Car : public Vehicle {
public:
    void start() override { cout << "Car engine roaring!\n"; }
};`
        },
        examples: [{
          title: 'Shape Area Calculation',
          problemStatement: 'Parent class Shape with virtual area() method. Derived Circle and Rectangle override area().',
          explanation: 'Calling shapePtr->area() dynamically calls Circle::area() or Rectangle::area() based on instantiated object.',
          input: 'Shape* s = new Circle(5.0); s->area();',
          output: '78.54'
        }],
        edgeCases: [
          'Forgetting virtual destructor causing memory leaks when deleting derived object via base pointer',
          'Diamond problem in C++ multiple inheritance without virtual inheritance',
          'Private inheritance hiding parent public methods'
        ],
        visualDiagram: {
          type: 'class',
          title: 'OOP Class Hierarchy Diagram',
          content: 'UML structure for Inheritance & Polymorphism.',
          nodes: [
            { id: 'n1', label: 'Vehicle (Base Class)\n+ start(): void', type: 'start', details: 'Parent class with virtual method' },
            { id: 'n2', label: 'Car (Derived Class)\n+ start(): void', type: 'process', details: 'Overrides start() with Car logic' },
            { id: 'n3', label: 'Bike (Derived Class)\n+ start(): void', type: 'process', details: 'Overrides start() with Bike logic' }
          ],
          edges: [
            { from: 'n2', to: 'n1', label: 'extends / inherits' },
            { from: 'n3', to: 'n1', label: 'extends / inherits' }
          ]
        },
        estimatedLearningTimeMinutes: 30
      }
    },
    { upsert: true, new: true }
  );

  // 5. OS Topic: Process Synchronization
  const osTopic = await Topic.findOneAndUpdate(
    { slug: 'os-process-synchronization-semaphores' },
    {
      title: 'Process Synchronization & Semaphores',
      slug: 'os-process-synchronization-semaphores',
      category: 'cs_core',
      subject: 'Operating Systems',
      difficulty: 'Hard',
      summary: 'Understand Critical Section Problem, Mutex, Semaphores, and Race Conditions.',
      description: 'Master concurrent process execution, mutual exclusion rules, counting vs binary semaphores, and Peterson algorithm.',
      learningContent: {
        learningObjectives: [
          'Solve Race Conditions using Mutual Exclusion, Progress, and Bounded Waiting',
          'Implement Mutex locks and Semaphore wait() / signal() primitives',
          'Solve Producer-Consumer & Reader-Writer Synchronization problems',
          'Identify Deadlocks vs Starvation in concurrent systems'
        ],
        what: 'Process Synchronization is the coordination of execution of multiple processes such that operating on shared data does not lead to inconsistent state (Race Conditions).',
        why: 'Core Operating Systems topic tested in technical interviews and computer science GATE / placement exams.',
        whereWhen: 'Used in multi-threaded software, database transaction locks, OS kernel schedulers, and web server worker pools.',
        conceptExplanation: `Critical Section Problem Requirements:
1. Mutual Exclusion: If process P is executing in critical section, no other process can execute in their critical section.
2. Progress: If no process is in critical section, selection of next process cannot be postponed indefinitely.
3. Bounded Waiting: Bound on number of times other processes can enter critical section after a request has been made.

Semaphore Operations:
- wait(S) / P(S): Decrements semaphore value. If S <= 0, process blocks.
- signal(S) / V(S): Increments semaphore value. Unblocks waiting process.`,
        examples: [{
          title: 'Producer-Consumer Problem',
          problemStatement: 'Producer inserts items into bounded buffer; Consumer removes items.',
          explanation: 'Mutex lock protects buffer pointer; Counting semaphores track empty/full slots.',
          input: 'Buffer size = 5, Producer produces item',
          output: 'Buffer updated safely without race condition'
        }],
        edgeCases: [
          'Deadlock caused by out-of-order semaphore wait() calls',
          'Priority Inversion where high priority task waits for low priority task holding mutex',
          'Busy waiting (Spinlocks) consuming CPU cycles unnecessarily'
        ],
        visualDiagram: {
          type: 'architecture',
          title: 'Process Synchronization Architecture',
          content: 'Critical section entry and semaphore lock guard.',
          nodes: [
            { id: 'n1', label: 'Process P1 / P2', type: 'start', details: 'Requesting access to shared buffer' },
            { id: 'n2', label: 'Semaphore Lock Guard (wait)', type: 'decision', details: 'Is lock free?' },
            { id: 'n3', label: 'CRITICAL SECTION (Shared Memory)', type: 'process', details: 'Exclusive write operation' },
            { id: 'n4', label: 'Semaphore Release (signal)', type: 'end', details: 'Unlock and notify next' }
          ],
          edges: [
            { from: 'n1', to: 'n2', label: 'Request' },
            { from: 'n2', to: 'n3', label: 'Acquired' },
            { from: 'n3', to: 'n4', label: 'Complete' }
          ]
        },
        estimatedLearningTimeMinutes: 40
      }
    },
    { upsert: true, new: true }
  );

  // 6. CN Topic: TCP 3-Way Handshake
  const cnTopic = await Topic.findOneAndUpdate(
    { slug: 'cn-tcp-three-way-handshake' },
    {
      title: 'TCP 3-Way Handshake & Connection Flow',
      slug: 'cn-tcp-three-way-handshake',
      category: 'cs_core',
      subject: 'Computer Networks',
      difficulty: 'Medium',
      summary: 'Master TCP sequence numbers, SYN/ACK packets, connection establishment, and teardown.',
      description: 'Comprehensive overview of reliable transport layer connection setup, SYN flood attacks, ISN generation, and FIN teardown.',
      learningContent: {
        learningObjectives: [
          'Understand SYN, SYN-ACK, and ACK packet exchange sequence',
          'Analyze initial sequence number (ISN) synchronization',
          'Understand TCP state transitions (LISTEN, SYN-SENT, SYN-RCVD, ESTABLISHED)',
          'Identify SYN Flood DoS vulnerability and SYN Cookies defense'
        ],
        what: 'The TCP 3-Way Handshake is a mechanism used in a TCP/IP network to create a connection between a server and a client before transmitting data.',
        why: 'Essential for understanding HTTP/HTTPS, WebSockets, network security, and backend systems.',
        whereWhen: 'Used whenever establishing reliable internet sockets (Web browsers, mobile apps, database drivers).',
        conceptExplanation: `Handshake Steps:
1. Step 1 (SYN): Client sends a TCP SYN packet to Server with Initial Sequence Number (ISN_c = x). State -> SYN-SENT.
2. Step 2 (SYN-ACK): Server receives SYN, responds with SYN-ACK packet containing Server ISN_s = y and ACK = x + 1. State -> SYN-RCVD.
3. Step 3 (ACK): Client receives SYN-ACK, sends ACK packet with ACK = y + 1. State -> ESTABLISHED on both ends! Data transfer can begin.`,
        examples: [{
          title: 'Web Browser Opening HTTPS Connection',
          problemStatement: 'Browser sends GET request to https://google.com.',
          explanation: 'Before HTTP GET request headers are sent, TCP 3-Way Handshake establishes reliable socket.',
          input: 'Client IP -> Server Port 443',
          output: 'TCP Socket State: ESTABLISHED'
        }],
        edgeCases: [
          'Packet loss during Step 2 causing client SYN retransmission timer to fire',
          'SYN Flood attack exhausting server listen queue with spoofed IPs',
          'RST (Reset) packet sent when connecting to closed port'
        ],
        visualDiagram: {
          type: 'network',
          title: 'TCP 3-Way Handshake Protocol Flow',
          content: 'Packet exchange between Client and Server.',
          nodes: [
            { id: 'n1', label: 'Client (Closed -> SYN-SENT)', type: 'source', details: 'Client initiates connection' },
            { id: 'n2', label: 'Packet 1: SYN (seq = x)', type: 'process', details: 'Client -> Server' },
            { id: 'n3', label: 'Server (Listen -> SYN-RCVD)', type: 'process', details: 'Server receives SYN' },
            { id: 'n4', label: 'Packet 2: SYN-ACK (seq = y, ack = x+1)', type: 'process', details: 'Server -> Client' },
            { id: 'n5', label: 'Packet 3: ACK (ack = y+1)', type: 'process', details: 'Client -> Server' },
            { id: 'n6', label: 'Both ESTABLISHED', type: 'output', details: 'Ready for HTTP data!' }
          ],
          edges: [
            { from: 'n1', to: 'n2', label: 'Send SYN' },
            { from: 'n2', to: 'n3', label: 'Receive' },
            { from: 'n3', to: 'n4', label: 'Send SYN-ACK' },
            { from: 'n4', to: 'n5', label: 'Receive & ACK' },
            { from: 'n5', to: 'n6', label: 'Connected' }
          ]
        },
        estimatedLearningTimeMinutes: 30
      }
    },
    { upsert: true, new: true }
  );

  // Seed sample practice questions for these topics if missing
  const seedQuestions = [
    {
      topicId: dsaTopic._id,
      title: 'Binary Search Implementation',
      slug: 'binary-search-implementation-step4',
      difficulty: 'Easy',
      type: 'coding',
      category: 'dsa',
      problemStatement: 'Given a sorted array of distinct integers `nums` and a target integer `target`, return the index of `target` if it is present, or `-1` if it is not present.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
      inputFormat: 'First line contains array nums. Second line contains target.',
      outputFormat: 'Return integer index.',
      constraints: '1 <= nums.length <= 10^4\n-10^4 <= nums[i], target <= 10^4',
      codeSnippets: {
        javascript: 'function search(nums, target) {\n  // Write your code here\n}',
        python: 'def search(nums, target):\n    # Write your code here\n    pass',
        cpp: 'int search(vector<int>& nums, int target) {\n    // Write your code here\n}',
        java: 'public int search(int[] nums, int target) {\n    // Write your code here\n}'
      },
      testCases: [
        { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
        { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
        { input: '[5]\n5', expectedOutput: '0', isHidden: true }
      ],
      solutionCode: {
        javascript: 'function search(nums, target) {\n  let l = 0, r = nums.length - 1;\n  while (l <= r) {\n    let m = Math.floor(l + (r - l) / 2);\n    if (nums[m] === target) return m;\n    if (nums[m] < target) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}'
      },
      solutionExplanation: 'Use standard lower-upper mid comparison algorithm.'
    },
    {
      topicId: dbmsTopic._id,
      title: 'Identify the JOIN Type',
      slug: 'identify-join-type-step4',
      difficulty: 'Easy',
      type: 'mcq',
      category: 'cs_core',
      problemStatement: 'Which SQL JOIN returns all rows from the Left table, even if there are no matches in the Right table?',
      mcqOptions: [
        { optionId: 'A', text: 'INNER JOIN', isCorrect: false },
        { optionId: 'B', text: 'LEFT JOIN', isCorrect: true },
        { optionId: 'C', text: 'RIGHT JOIN', isCorrect: false },
        { optionId: 'D', text: 'FULL OUTER JOIN', isCorrect: false }
      ],
      solutionExplanation: 'LEFT JOIN keeps all rows from the left table and fills NULLs for non-matching right table rows.'
    },
    {
      topicId: aptTopic._id,
      title: 'Time and Work Calculation MCQ',
      slug: 'time-work-calculation-step4',
      difficulty: 'Easy',
      type: 'mcq',
      category: 'aptitude',
      problemStatement: 'A can finish a task in 10 days, and B can finish it in 15 days. Working together, in how many days will they finish the task?',
      mcqOptions: [
        { optionId: 'A', text: '5 days', isCorrect: false },
        { optionId: 'B', text: '6 days', isCorrect: true },
        { optionId: 'C', text: '8 days', isCorrect: false },
        { optionId: 'D', text: '12.5 days', isCorrect: false }
      ],
      solutionExplanation: 'Time = (10 * 15) / (10 + 15) = 150 / 25 = 6 days.'
    }
  ];

  for (const qData of seedQuestions) {
    await Question.findOneAndUpdate(
      { slug: qData.slug },
      qData,
      { upsert: true, new: true }
    );
  }

  console.log('[SeedLearningContent] Representative topics & practice questions seeded successfully!');
  return { dsaTopic, dbmsTopic, aptTopic, oopsTopic, osTopic, cnTopic };
};

// If run directly via command line
if (process.argv[1]?.includes('seedLearningContent.js')) {
  (async () => {
    try {
      await connectDB();
      await seedRepresentativeTopics();
      console.log('[SeedLearningContent] Done!');
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[SeedLearningContent] Error seeding topics:', err);
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    }
  })();
}
