export interface CuratedProblem {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reason?: string;
}

export interface TopicCurationData {
  relatedTopics: string[];
  recommendedProblems: CuratedProblem[];
}

export const TOPIC_CURATION_MAP: Record<string, TopicCurationData> = {
  // 1. Trie
  Trie: {
    relatedTopics: ["Hash Table", "String", "Tree", "Design"],
    recommendedProblems: [
      { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", reason: "Core foundational trie implementation" },
      { slug: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", difficulty: "Medium", reason: "Trie with wildcard backtracking" },
      { slug: "word-search-ii", title: "Word Search II", difficulty: "Hard", reason: "Trie + 2D Matrix DFS" },
      { slug: "replace-words", title: "Replace Words", difficulty: "Medium", reason: "Prefix matching and string normalization" },
      { slug: "maximum-xor-of-two-numbers-in-an-array", title: "Maximum XOR of Two Numbers in an Array", difficulty: "Medium", reason: "Bitwise prefix trie" },
    ],
  },

  // 2. Bit Manipulation
  "Bit Manipulation": {
    relatedTopics: ["Math", "Array", "Binary Search"],
    recommendedProblems: [
      { slug: "single-number", title: "Single Number", difficulty: "Easy", reason: "XOR cancellation property" },
      { slug: "number-of-1-bits", title: "Number of 1 Bits", difficulty: "Easy", reason: "Brian Kernighan's bit-counting algorithm" },
      { slug: "counting-bits", title: "Counting Bits", difficulty: "Easy", reason: "DP with bit offsets" },
      { slug: "reverse-bits", title: "Reverse Bits", difficulty: "Easy", reason: "Bit reversal and shifting" },
      { slug: "missing-number", title: "Missing Number", difficulty: "Easy", reason: "XOR array indexing" },
    ],
  },

  // 3. Doubly-Linked List
  "Doubly-Linked List": {
    relatedTopics: ["Linked List", "Design", "Hash Table"],
    recommendedProblems: [
      { slug: "lru-cache", title: "LRU Cache", difficulty: "Medium", reason: "Hash map + Doubly-linked list eviction" },
      { slug: "design-browser-history", title: "Design Browser History", difficulty: "Medium", reason: "Forward & backward history navigation" },
      { slug: "flatten-a-multilevel-doubly-linked-list", title: "Flatten a Multilevel Doubly Linked List", difficulty: "Medium", reason: "Recursive child pointer flattening" },
      { slug: "lfu-cache", title: "LFU Cache", difficulty: "Hard", reason: "Frequency-based doubly-linked list nodes" },
      { slug: "all-oone-data-structure", title: "All O`one Data Structure", difficulty: "Hard", reason: "O(1) bucket-based doubly-linked list" },
    ],
  },

  // 4. Dynamic Programming
  "Dynamic Programming": {
    relatedTopics: ["Recursion", "Memoization", "Array", "Divide and Conquer"],
    recommendedProblems: [
      { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", reason: "Base 1D Fibonacci state transition" },
      { slug: "coin-change", title: "Coin Change", difficulty: "Medium", reason: "Unbounded knapsack subproblem" },
      { slug: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", difficulty: "Medium", reason: "Classic DP transition / patience sorting" },
      { slug: "house-robber", title: "House Robber", difficulty: "Medium", reason: "Non-adjacent choice state optimization" },
      { slug: "word-break", title: "Word Break", difficulty: "Medium", reason: "Prefix segmentation subproblems" },
    ],
  },

  // 5. Backtracking
  Backtracking: {
    relatedTopics: ["Recursion", "Depth-First Search", "Array"],
    recommendedProblems: [
      { slug: "subsets", title: "Subsets", difficulty: "Medium", reason: "Power set generation state tree" },
      { slug: "permutations", title: "Permutations", difficulty: "Medium", reason: "State tree traversal with visited pruning" },
      { slug: "combination-sum", title: "Combination Sum", difficulty: "Medium", reason: "Reuse candidates with backtrack recursion" },
      { slug: "word-search", title: "Word Search", difficulty: "Medium", reason: "2D grid character backtrack search" },
      { slug: "n-queens", title: "N-Queens", difficulty: "Hard", reason: "Constraint propagation and diagonal attacks" },
    ],
  },

  // 6. Sliding Window
  "Sliding Window": {
    relatedTopics: ["Two Pointers", "String", "Array", "Hash Table"],
    recommendedProblems: [
      { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", reason: "Dynamic variable window expansion & contraction" },
      { slug: "longest-repeating-character-replacement", title: "Longest Repeating Character Replacement", difficulty: "Medium", reason: "Window frequency threshold condition" },
      { slug: "permutation-in-string", title: "Permutation in String", difficulty: "Medium", reason: "Fixed-size window matching character count" },
      { slug: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", reason: "Two-pointer contractive window" },
      { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", reason: "Sliding window with monotonic deque" },
    ],
  },

  // 7. Heap (Priority Queue)
  "Heap (Priority Queue)": {
    relatedTopics: ["Greedy", "Sorting", "Tree", "Data Stream"],
    recommendedProblems: [
      { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", reason: "Min-heap bounded to k elements" },
      { slug: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", reason: "Frequency counting + priority queue" },
      { slug: "task-scheduler", title: "Task Scheduler", difficulty: "Medium", reason: "Greedy cooling interval management" },
      { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", reason: "Dual-heap (min-max) balance pattern" },
      { slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", reason: "K-way heap merge" },
    ],
  },

  // 8. Monotonic Stack
  "Monotonic Stack": {
    relatedTopics: ["Stack", "Array", "Monotonic Queue"],
    recommendedProblems: [
      { slug: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", reason: "Next greater element index delta" },
      { slug: "next-greater-element-i", title: "Next Greater Element I", difficulty: "Easy", reason: "Monotonic decreasing stack with hash map" },
      { slug: "online-stock-span", title: "Online Stock Span", difficulty: "Medium", reason: "Consecutive lower price accumulator" },
      { slug: "largest-rectangle-in-histogram", title: "Largest Rectangle in Histogram", difficulty: "Hard", reason: "Boundary width detection via stack" },
      { slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", reason: "Bounded volume calculation via stack" },
    ],
  },

  // 9. Graph
  Graph: {
    relatedTopics: ["Breadth-First Search", "Depth-First Search", "Union Find", "Topological Sort"],
    recommendedProblems: [
      { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", reason: "Grid connected components traversal" },
      { slug: "clone-graph", title: "Clone Graph", difficulty: "Medium", reason: "Deep graph copying with vertex mapping" },
      { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", reason: "Cycle detection in directed graph" },
      { slug: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", reason: "Multi-source ocean flow boundary DFS" },
      { slug: "network-delay-time", title: "Network Delay Time", difficulty: "Medium", reason: "Dijkstra's shortest path algorithm" },
    ],
  },

  // 10. Topological Sort
  "Topological Sort": {
    relatedTopics: ["Graph", "Depth-First Search", "Breadth-First Search"],
    recommendedProblems: [
      { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", reason: "Kahn's in-degree zero queue algorithm" },
      { slug: "course-schedule-ii", title: "Course Schedule II", difficulty: "Medium", reason: "Ordering dependency reconstruction" },
      { slug: "alien-dictionary", title: "Alien Dictionary", difficulty: "Hard", reason: "Lexicographical character graph topological sort" },
      { slug: "minimum-height-trees", title: "Minimum Height Trees", difficulty: "Medium", reason: "Trimming leaf nodes inward" },
      { slug: "sort-items-by-groups-respecting-dependencies", title: "Sort Items by Groups Respecting Dependencies", difficulty: "Hard", reason: "Two-level hierarchical topological ordering" },
    ],
  },

  // 11. Binary Search
  "Binary Search": {
    relatedTopics: ["Array", "Two Pointers", "Divide and Conquer"],
    recommendedProblems: [
      { slug: "binary-search", title: "Binary Search", difficulty: "Easy", reason: "Foundational log(n) invariant" },
      { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", reason: "Halving search space with shifted inflection point" },
      { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", reason: "Rotated array minimum boundary convergence" },
      { slug: "koko-eating-bananas", title: "Koko Eating Bananas", difficulty: "Medium", reason: "Binary search on monotonic answer space" },
      { slug: "search-a-2d-matrix", title: "Search a 2D Matrix", difficulty: "Medium", reason: "Row/col coordinate transformation binary search" },
    ],
  },

  // 12. Two Pointers
  "Two Pointers": {
    relatedTopics: ["Array", "String", "Sorting", "Sliding Window"],
    recommendedProblems: [
      { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", reason: "Converging pointers string check" },
      { slug: "two-sum-ii-input-array-is-sorted", title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", reason: "Sorted array opposite ends convergence" },
      { slug: "3sum", title: "3Sum", difficulty: "Medium", reason: "Fixing one element + two-pointer sweep" },
      { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", reason: "Greedy height elimination with two pointers" },
      { slug: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "Hard", reason: "Two pointers with left_max and right_max" },
    ],
  },

  // 13. Tree & Binary Tree
  Tree: {
    relatedTopics: ["Binary Tree", "Depth-First Search", "Breadth-First Search", "Binary Search Tree"],
    recommendedProblems: [
      { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", reason: "Recursive tree height traversal" },
      { slug: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", reason: "Recursive child subtree swap" },
      { slug: "diameter-of-binary-tree", title: "Diameter of Binary Tree", difficulty: "Easy", reason: "Subtree height accumulation" },
      { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", reason: "Queue-based BFS level grouping" },
      { slug: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", reason: "Post-order LCA resolution" },
    ],
  },
  "Binary Tree": {
    relatedTopics: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Search Tree"],
    recommendedProblems: [
      { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", reason: "Recursive tree height traversal" },
      { slug: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", reason: "Recursive child subtree swap" },
      { slug: "diameter-of-binary-tree", title: "Diameter of Binary Tree", difficulty: "Easy", reason: "Subtree height accumulation" },
      { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", reason: "Queue-based BFS level grouping" },
      { slug: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", reason: "Post-order LCA resolution" },
    ],
  },

  // 14. Binary Search Tree
  "Binary Search Tree": {
    relatedTopics: ["Tree", "Binary Tree", "Binary Search"],
    recommendedProblems: [
      { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", reason: "In-order monotonic BST invariant" },
      { slug: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", reason: "In-order traversal rank extraction" },
      { slug: "lowest-common-ancestor-of-a-binary-search-tree", title: "Lowest Common Ancestor of a Binary Search Tree", difficulty: "Medium", reason: "BST split condition LCA" },
      { slug: "insert-into-a-binary-search-tree", title: "Insert into a Binary Search Tree", difficulty: "Medium", reason: "BST path insertion" },
      { slug: "delete-node-in-a-bst", title: "Delete Node in a BST", difficulty: "Medium", reason: "BST successor replacement" },
    ],
  },

  // 15. Linked List
  "Linked List": {
    relatedTopics: ["Two Pointers", "Recursion", "Stack", "Doubly-Linked List"],
    recommendedProblems: [
      { slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", reason: "In-place pointer reversal" },
      { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", reason: "Dummy head two-pointer merge" },
      { slug: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", reason: "Floyd's fast & slow pointer cycle detection" },
      { slug: "reorder-list", title: "Reorder List", difficulty: "Medium", reason: "Find middle, reverse second half, and interleave" },
      { slug: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", difficulty: "Medium", reason: "Fast pointer offset gap technique" },
    ],
  },

  // 16. Stack
  Stack: {
    relatedTopics: ["Monotonic Stack", "Queue", "String", "Design"],
    recommendedProblems: [
      { slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", reason: "LIFO matching bracket verification" },
      { slug: "min-stack", title: "Min Stack", difficulty: "Medium", reason: "Auxiliary minimum tracking in O(1)" },
      { slug: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", reason: "Postfix operand evaluation" },
      { slug: "generate-parentheses", title: "Generate Parentheses", difficulty: "Medium", reason: "Backtracking with balanced stack rules" },
      { slug: "daily-temperatures", title: "Daily Temperatures", difficulty: "Medium", reason: "Monotonic stack index delta" },
    ],
  },

  // 17. Queue & Monotonic Queue
  Queue: {
    relatedTopics: ["Breadth-First Search", "Sliding Window", "Design", "Stack"],
    recommendedProblems: [
      { slug: "implement-queue-using-stacks", title: "Implement Queue using Stacks", difficulty: "Easy", reason: "FIFO simulation with two LIFO stacks" },
      { slug: "design-circular-queue", title: "Design Circular Queue", difficulty: "Medium", reason: "Ring buffer pointer wrapping" },
      { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", reason: "Monotonic double-ended queue" },
      { slug: "shortest-subarray-with-sum-at-least-k", title: "Shortest Subarray with Sum at Least K", difficulty: "Hard", reason: "Prefix sums + monotonic deque" },
      { slug: "dota2-senate", title: "Dota2 Senate", difficulty: "Medium", reason: "Two queue round-robin elimination" },
    ],
  },
  "Monotonic Queue": {
    relatedTopics: ["Queue", "Sliding Window", "Monotonic Stack"],
    recommendedProblems: [
      { slug: "sliding-window-maximum", title: "Sliding Window Maximum", difficulty: "Hard", reason: "Monotonic double-ended queue" },
      { slug: "shortest-subarray-with-sum-at-least-k", title: "Shortest Subarray with Sum at Least K", difficulty: "Hard", reason: "Prefix sums + monotonic deque" },
      { slug: "constrained-subsequence-sum", title: "Constrained Subsequence Sum", difficulty: "Hard", reason: "DP state optimization with deque" },
      { slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", title: "Longest Continuous Subarray With Limit", difficulty: "Medium", reason: "Dual monotonic deques (min and max)" },
      { slug: "jump-game-vi", title: "Jump Game VI", difficulty: "Medium", reason: "Sliding window max score DP" },
    ],
  },

  // 18. Breadth-First Search
  "Breadth-First Search": {
    relatedTopics: ["Depth-First Search", "Graph", "Tree", "Shortest Path"],
    recommendedProblems: [
      { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", reason: "Queue-based level order extraction" },
      { slug: "rotting-oranges", title: "Rotting Oranges", difficulty: "Medium", reason: "Multi-source simultaneous grid BFS" },
      { slug: "open-the-lock", title: "Open the Lock", difficulty: "Medium", reason: "State space shortest transformation steps" },
      { slug: "word-ladder", title: "Word Ladder", difficulty: "Hard", reason: "Bidirectional BFS word transformation" },
      { slug: "snakes-and-ladders", title: "Snakes and Ladders", difficulty: "Medium", reason: "Shortest turn navigation on board graph" },
    ],
  },

  // 19. Depth-First Search
  "Depth-First Search": {
    relatedTopics: ["Breadth-First Search", "Graph", "Tree", "Backtracking"],
    recommendedProblems: [
      { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", reason: "Connected component flooding" },
      { slug: "max-area-of-island", title: "Max Area of Island", difficulty: "Medium", reason: "Area accumulator via recursive DFS" },
      { slug: "surrounded-regions", title: "Surrounded Regions", difficulty: "Medium", reason: "Boundary-first reverse flood fill" },
      { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", reason: "Graph 3-color cycle detection DFS" },
      { slug: "all-paths-from-source-to-target", title: "All Paths From Source to Target", difficulty: "Medium", reason: "DAG complete path enumeration" },
    ],
  },

  // 20. Union Find
  "Union Find": {
    relatedTopics: ["Graph", "Tree", "Array"],
    recommendedProblems: [
      { slug: "number-of-provinces", title: "Number of Provinces", difficulty: "Medium", reason: "Disjoint set connected components count" },
      { slug: "redundant-connection", title: "Redundant Connection", difficulty: "Medium", reason: "Cycle-forming edge detection" },
      { slug: "number-of-operations-to-make-network-connected", title: "Number of Operations to Make Network Connected", difficulty: "Medium", reason: "Surplus cables vs isolated graph components" },
      { slug: "accounts-merge", title: "Accounts Merge", difficulty: "Medium", reason: "String identifier equivalence grouping" },
      { slug: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", difficulty: "Medium", reason: "Adjacent numerical cluster merging" },
    ],
  },

  // 21. Greedy
  Greedy: {
    relatedTopics: ["Sorting", "Array", "Dynamic Programming", "Heap (Priority Queue)"],
    recommendedProblems: [
      { slug: "jump-game", title: "Jump Game", difficulty: "Medium", reason: "Farthest reach tracker" },
      { slug: "jump-game-ii", title: "Jump Game II", difficulty: "Medium", reason: "Layered breadth greedy window" },
      { slug: "gas-station", title: "Gas Station", difficulty: "Medium", reason: "Deficit sub-tour reset property" },
      { slug: "hand-of-straights", title: "Hand of Straights", difficulty: "Medium", reason: "Greedy group formation from minimum" },
      { slug: "partition-labels", title: "Partition Labels", difficulty: "Medium", reason: "Last seen character index interval partition" },
    ],
  },

  // 22. Matrix
  Matrix: {
    relatedTopics: ["Array", "Depth-First Search", "Breadth-First Search"],
    recommendedProblems: [
      { slug: "rotate-image", title: "Rotate Image", difficulty: "Medium", reason: "In-place transpose and reverse" },
      { slug: "spiral-matrix", title: "Spiral Matrix", difficulty: "Medium", reason: "4-boundary shrinkage traversal" },
      { slug: "set-matrix-zeroes", title: "Set Matrix Zeroes", difficulty: "Medium", reason: "O(1) space first row/col markers" },
      { slug: "word-search", title: "Word Search", difficulty: "Medium", reason: "2D grid backtrack character path" },
      { slug: "search-a-2d-matrix", title: "Search a 2D Matrix", difficulty: "Medium", reason: "Virtual sorted 1D array indexing" },
    ],
  },

  // 23. Hash Table
  "Hash Table": {
    relatedTopics: ["Array", "String", "Design"],
    recommendedProblems: [
      { slug: "two-sum", title: "Two Sum", difficulty: "Easy", reason: "Complement lookup in O(1)" },
      { slug: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", reason: "Sorted key or character tuple grouping" },
      { slug: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", difficulty: "Medium", reason: "Set-based sequence start detection" },
      { slug: "subarray-sum-equals-k", title: "Subarray Sum Equals K", difficulty: "Medium", reason: "Prefix sum frequency map" },
      { slug: "first-unique-character-in-a-string", title: "First Unique Character in a String", difficulty: "Easy", reason: "Frequency counting and index scanning" },
    ],
  },

  // 24. String
  String: {
    relatedTopics: ["Two Pointers", "Hash Table", "Sliding Window", "Dynamic Programming"],
    recommendedProblems: [
      { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", reason: "Alphanumeric pointer convergence" },
      { slug: "longest-common-prefix", title: "Longest Common Prefix", difficulty: "Easy", reason: "Vertical scanning or sorting bounds" },
      { slug: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", reason: "Character frequency hashing" },
      { slug: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "Medium", reason: "Expand around center pattern" },
      { slug: "palindromic-substrings", title: "Palindromic Substrings", difficulty: "Medium", reason: "Center expansion count" },
    ],
  },

  // 25. Array
  Array: {
    relatedTopics: ["Two Pointers", "Hash Table", "Binary Search", "Sorting"],
    recommendedProblems: [
      { slug: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", reason: "Hash set membership" },
      { slug: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "Medium", reason: "Prefix & suffix product accumulator" },
      { slug: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", reason: "Kadane's algorithm max local sum" },
      { slug: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", reason: "Sorting by start time + overlap merge" },
      { slug: "rotate-array", title: "Rotate Array", difficulty: "Medium", reason: "Triple array reversal algorithm" },
    ],
  },

  // 26. Prefix Sum
  "Prefix Sum": {
    relatedTopics: ["Array", "Hash Table"],
    recommendedProblems: [
      { slug: "range-sum-query-immutable", title: "Range Sum Query - Immutable", difficulty: "Easy", reason: "O(1) range query via cumulative sum" },
      { slug: "subarray-sum-equals-k", title: "Subarray Sum Equals K", difficulty: "Medium", reason: "Prefix difference frequency map" },
      { slug: "continuous-subarray-sum", title: "Continuous Subarray Sum", difficulty: "Medium", reason: "Modulo prefix sum duplicate index check" },
      { slug: "find-pivot-index", title: "Find Pivot Index", difficulty: "Easy", reason: "Total sum vs left cumulative sum" },
      { slug: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "Medium", reason: "Prefix and suffix product passes" },
    ],
  },

  // 27. Sorting
  Sorting: {
    relatedTopics: ["Array", "Two Pointers", "Divide and Conquer", "Greedy"],
    recommendedProblems: [
      { slug: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", reason: "Interval sorting and linear merge" },
      { slug: "sort-colors", title: "Sort Colors", difficulty: "Medium", reason: "Dutch National Flag 3-pointer partition" },
      { slug: "non-overlapping-intervals", title: "Non-overlapping Intervals", difficulty: "Medium", reason: "Sort by finish time greedy elimination" },
      { slug: "largest-number", title: "Largest Number", difficulty: "Medium", reason: "Custom comparator string sorting" },
      { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", reason: "Quickselect O(n) average partition" },
    ],
  },

  // 28. Math
  Math: {
    relatedTopics: ["Bit Manipulation", "Number Theory", "Geometry"],
    recommendedProblems: [
      { slug: "happy-number", title: "Happy Number", difficulty: "Easy", reason: "Cycle detection with square digits" },
      { slug: "plus-one", title: "Plus One", difficulty: "Easy", reason: "Arbitrary-precision arithmetic carry" },
      { slug: "powx-n", title: "Pow(x, n)", difficulty: "Medium", reason: "Fast binary exponentiation" },
      { slug: "multiply-strings", title: "Multiply Strings", difficulty: "Medium", reason: "Schoolbook column-wise digit multiplication" },
      { slug: "count-primes", title: "Count Primes", difficulty: "Medium", reason: "Sieve of Eratosthenes" },
    ],
  },

  // 29. Design
  Design: {
    relatedTopics: ["Hash Table", "Linked List", "Doubly-Linked List", "Data Stream"],
    recommendedProblems: [
      { slug: "lru-cache", title: "LRU Cache", difficulty: "Medium", reason: "Hash map + Doubly-linked list O(1)" },
      { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", reason: "Prefix tree structure design" },
      { slug: "min-stack", title: "Min Stack", difficulty: "Medium", reason: "O(1) push, pop, min design" },
      { slug: "design-add-and-search-words-data-structure", title: "Design Add and Search Words Data Structure", difficulty: "Medium", reason: "Wildcard dictionary search" },
      { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", reason: "Two-heap median balancer" },
    ],
  },

  // 30. Recursion & Divide and Conquer
  Recursion: {
    relatedTopics: ["Tree", "Backtracking", "Dynamic Programming", "Divide and Conquer"],
    recommendedProblems: [
      { slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", reason: "Recursive sub-list reversal" },
      { slug: "powx-n", title: "Pow(x, n)", difficulty: "Medium", reason: "Divide-and-conquer exponent halving" },
      { slug: "k-th-symbol-in-grammar", title: "K-th Symbol in Grammar", difficulty: "Medium", reason: "Parent row binary tree bit recursion" },
      { slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", reason: "Pairwise divide-and-conquer list merge" },
      { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", reason: "Recursive overlapping subproblems" },
    ],
  },
  "Divide and Conquer": {
    relatedTopics: ["Recursion", "Binary Search", "Tree", "Sorting"],
    recommendedProblems: [
      { slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", reason: "Pairwise divide-and-conquer list merge" },
      { slug: "kth-largest-element-in-an-array", title: "Kth Largest Element in an Array", difficulty: "Medium", reason: "Quickselect partition" },
      { slug: "powx-n", title: "Pow(x, n)", difficulty: "Medium", reason: "Divide-and-conquer exponent halving" },
      { slug: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree", difficulty: "Medium", reason: "Subtree partition by root index" },
      { slug: "sort-list", title: "Sort List", difficulty: "Medium", reason: "Merge sort on singly-linked list" },
    ],
  },
};

/**
 * Default fallback curated problems and related topics for any DSA category.
 */
const DEFAULT_FALLBACK_PROBLEMS: CuratedProblem[] = [
  { slug: "two-sum", title: "Two Sum", difficulty: "Easy", reason: "Foundational pattern" },
  { slug: "valid-palindrome", title: "Valid Palindrome", difficulty: "Easy", reason: "Core string pattern" },
  { slug: "coin-change", title: "Coin Change", difficulty: "Medium", reason: "Classic optimization problem" },
  { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", reason: "Standard traversal pattern" },
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", reason: "Core window pattern" },
];

const DEFAULT_FALLBACK_RELATED: string[] = ["Array", "Hash Table", "Two Pointers", "Binary Search"];

/**
 * Returns 3-5 curated practice problems and related topics for a given DSA category.
 * If user has already solved some of the problems, prioritizes unsolved ones.
 */
export function getTopicCuration(
  topicName: string,
  solvedSlugsSet?: Set<string>
): {
  relatedTopics: string[];
  recommendedProblems: Array<CuratedProblem & { isAlreadySolved?: boolean }>;
} {
  const normalized = topicName.trim();
  const entry = TOPIC_CURATION_MAP[normalized];

  const rawProblems = entry ? entry.recommendedProblems : DEFAULT_FALLBACK_PROBLEMS;
  const rawRelated = entry ? entry.relatedTopics : DEFAULT_FALLBACK_RELATED;

  // Annotate whether user already solved each problem
  const annotated = rawProblems.map((prob) => ({
    ...prob,
    isAlreadySolved: solvedSlugsSet ? solvedSlugsSet.has(prob.slug.toLowerCase()) : false,
  }));

  // Sort unsolved problems to the front so the user always sees fresh problems to practice
  const sorted = [...annotated].sort((a, b) => {
    if (a.isAlreadySolved === b.isAlreadySolved) return 0;
    return a.isAlreadySolved ? 1 : -1;
  });

  return {
    relatedTopics: rawRelated.slice(0, 4),
    recommendedProblems: sorted.slice(0, 5),
  };
}
