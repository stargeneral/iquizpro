/**
 * Question Bank — Static quiz question data for IQuizPros
 * Extracted from topics.js to reduce file size.
 * Exposes window.QuizProsQuestionBank
 * Phase 9: Added difficulty levels, explanations, expanded question pools (25+ per topic)
 */

window.QuizProsQuestionBank = (function () {
  'use strict';

  // ─── Default Personality Types ─────────────────────────────────────────────
  const defaultPersonalityTypes = {
    leader: {
      title: 'The Leader',
      description: 'You are a natural leader who takes charge and inspires others. You\'re decisive, confident, and goal-oriented, with a talent for organizing people and resources to achieve objectives.',
      characteristics: ['Decisive and action-oriented', 'Strategic thinker', 'Confident and assertive', 'Goal-focused', 'Inspiring to others'],
      strengths: 'Your ability to make decisions quickly and take initiative makes you excellent in leadership roles. You naturally inspire confidence in others.',
      challenges: 'Sometimes you may need to slow down and listen more to others\' input. Developing patience and empathy can enhance your leadership.',
      imagePath: 'assets/images/leader-personality.webp'
    },
    thinker: {
      title: 'The Analytical Thinker',
      description: 'You are a logical, analytical person who excels at solving complex problems. You value precision, data, and rational thinking, approaching challenges with a methodical mindset.',
      characteristics: ['Logical and rational', 'Detail-oriented', 'Thoughtful and reflective', 'Systematic approach', 'Intellectually curious'],
      strengths: 'Your analytical skills and attention to detail allow you to solve complex problems that others might miss. You excel at critical thinking.',
      challenges: 'You might sometimes overthink decisions or get caught in analysis paralysis. Trusting your intuition occasionally can be beneficial.',
      imagePath: 'assets/images/thinker-personality.webp'
    },
    social: {
      title: 'The Social Connector',
      description: 'You are a people-oriented person who thrives on human connection. Empathetic and communicative, you build strong relationships and create harmony in groups.',
      characteristics: ['Empathetic and understanding', 'Excellent communicator', 'Relationship-focused', 'Cooperative team player', 'Socially perceptive'],
      strengths: 'Your emotional intelligence and communication skills help you build strong relationships and resolve conflicts effectively.',
      challenges: 'You might sometimes prioritize others\' needs over your own. Setting healthy boundaries can help you maintain your energy.',
      imagePath: 'assets/images/social-personality.webp'
    },
    intuitive: {
      title: 'The Creative Intuitive',
      description: 'You are an imaginative, big-picture thinker who sees possibilities everywhere. You trust your intuition, embrace change, and bring creative solutions to challenges.',
      characteristics: ['Imaginative and creative', 'Future-oriented', 'Adaptable to change', 'Trusts gut feelings', 'Sees connections and patterns'],
      strengths: 'Your creativity and ability to see the big picture allow you to develop innovative solutions and adapt quickly to change.',
      challenges: 'You might sometimes need to focus more on practical details and implementation. Grounding your ideas can help them become reality.',
      imagePath: 'assets/images/intuitive-personality.webp'
    }
  };

  // ─── Default Topics ─────────────────────────────────────────────────────────
  const defaultTopics = [
    { id: 'general',     name: 'General Knowledge', description: 'Test your knowledge across a variety of subjects',      icon: 'fas fa-brain',           isPersonality: false },
    { id: 'uganda',      name: 'Uganda',             description: 'The Pearl of Africa - Test your knowledge about Uganda', icon: 'fas fa-globe-africa',    isPersonality: false },
    { id: 'history',     name: 'History',            description: 'Journey through time with historical facts',             icon: 'fas fa-landmark',        isPersonality: false },
    { id: 'geography',   name: 'Geography',          description: 'Test your knowledge of the world',                      icon: 'fas fa-globe-americas',  isPersonality: false },
    { id: 'entertainment', name: 'Entertainment',    description: 'Movies, music, TV shows and more',                      icon: 'fas fa-film',            isPersonality: false },
    { id: 'science',     name: 'Science',            description: 'Explore the wonders of science and technology',         icon: 'fas fa-flask',           isPersonality: false },
    { id: 'technology',  name: 'Technology',          description: 'Test your knowledge of computing, coding and tech',     icon: 'fas fa-laptop-code',     isPersonality: false },
    { id: 'sports',      name: 'Sports',              description: 'Challenge yourself with sports trivia from around the world', icon: 'fas fa-futbol',   isPersonality: false },
    { id: 'music',       name: 'Music',               description: 'How well do you know the world of music?',             icon: 'fas fa-music',           isPersonality: false },
    { id: 'food',        name: 'Food & Cooking',      description: 'Explore flavours, cuisines and culinary facts',         icon: 'fas fa-utensils',        isPersonality: false },
    { id: 'movies',      name: 'Movies & TV',         description: 'Test your knowledge of cinema and television',          icon: 'fas fa-tv',              isPersonality: false },
    { id: 'personality', name: 'Personality Quiz',   description: 'Discover your personality type',                       icon: 'fas fa-user',            isPersonality: true  }
  ];

  // ─── General Knowledge Questions ───────────────────────────────────────────
  const generalQuestions = [
    { question: 'What is the capital of France?',              options: ['London', 'Berlin', 'Paris', 'Madrid'],           answer: 2, difficulty: 'easy',   category: 'geography',    explanation: 'Paris has been the capital of France since 987 AD.' },
    { question: 'Which planet is known as the Red Planet?',    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],            answer: 1, difficulty: 'easy',   category: 'science',      explanation: 'Mars appears red because of iron oxide (rust) covering its surface.' },
    { question: 'Who painted the Mona Lisa?',                  options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Michelangelo'], answer: 2, difficulty: 'easy', category: 'art', explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.' },
    { question: 'What is the chemical symbol for gold?',       options: ['Go', 'Gd', 'Au', 'Ag'],                         answer: 2, difficulty: 'medium', category: 'science',      explanation: 'Au comes from the Latin word "Aurum" meaning gold.' },
    { question: 'Which country is home to the kangaroo?',      options: ['New Zealand', 'South Africa', 'Australia', 'Brazil'], answer: 2, difficulty: 'easy', category: 'geography', explanation: 'Kangaroos are native to Australia and are not found naturally anywhere else.' },
    { question: 'What is the largest ocean on Earth?',         options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'], answer: 3, difficulty: 'easy', category: 'geography', explanation: 'The Pacific Ocean covers about 165 million km² — larger than all land combined.' },
    { question: 'Who wrote \'Romeo and Juliet\'?',             options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], answer: 1, difficulty: 'easy', category: 'literature', explanation: 'Shakespeare wrote Romeo and Juliet around 1594–1596.' },
    { question: 'What is the square root of 64?',              options: ['6', '8', '10', '12'],                            answer: 1, difficulty: 'easy',   category: 'mathematics',  explanation: '8 × 8 = 64, so the square root of 64 is 8.' },
    { question: 'Which element has the chemical symbol \'O\'?', options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],       answer: 1, difficulty: 'easy',   category: 'science',      explanation: 'O is the symbol for Oxygen, element 8 on the periodic table.' },
    { question: 'In which year did World War II end?',         options: ['1943', '1945', '1947', '1950'],                  answer: 1, difficulty: 'easy',   category: 'history',      funFact: 'World War II officially ended on September 2, 1945, with Japan\'s formal surrender.' },
    { question: 'Which gas makes up most of Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answer: 2, difficulty: 'easy', category: 'science', explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere; oxygen makes up 21%.' },
    { question: 'How many sides does a hexagon have?',         options: ['5', '6', '7', '8'],                              answer: 1, difficulty: 'easy',   category: 'mathematics',  explanation: 'Hex means six in Greek — a hexagon has exactly 6 sides.' },
    { question: 'What is the tallest animal on land?',         options: ['Elephant', 'Horse', 'Giraffe', 'Camel'],         answer: 2, difficulty: 'easy',   category: 'science',      explanation: 'Giraffes can reach heights of up to 5.5–6 metres (18–20 feet).' },
    { question: 'In which country is the Taj Mahal located?',  options: ['Pakistan', 'Bangladesh', 'India', 'Nepal'],       answer: 2, difficulty: 'easy',   category: 'geography',    explanation: 'The Taj Mahal is in Agra, India, built by Mughal emperor Shah Jahan in 1632.' },
    { question: 'What is the largest continent?',              options: ['Africa', 'North America', 'Asia', 'Europe'],     answer: 2, difficulty: 'easy',   category: 'geography',    explanation: 'Asia covers about 44.6 million km² — roughly 30% of Earth\'s total land area.' },
    { question: 'Who invented the telephone?',                 options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Guglielmo Marconi'], answer: 2, difficulty: 'medium', category: 'history', explanation: 'Alexander Graham Bell was awarded the first patent for the telephone in 1876.' },
    { question: 'What is the currency of Japan?',              options: ['Yuan', 'Won', 'Yen', 'Baht'],                    answer: 2, difficulty: 'easy',   category: 'geography',    explanation: 'The Japanese Yen (¥) has been Japan\'s official currency since 1871.' },
    { question: 'Which planet is closest to the Sun?',         options: ['Venus', 'Earth', 'Mercury', 'Mars'],             answer: 2, difficulty: 'easy',   category: 'science',      explanation: 'Mercury is the closest planet to the Sun at an average distance of 57.9 million km.' },
    { question: 'How many colors are in a rainbow?',           options: ['5', '6', '7', '8'],                              answer: 2, difficulty: 'easy',   category: 'science',      explanation: 'A rainbow has 7 colours: red, orange, yellow, green, blue, indigo and violet.' },
    { question: 'Who was the first person to walk on the Moon?', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'John Glenn'], answer: 2, difficulty: 'easy', category: 'history', explanation: 'Neil Armstrong stepped onto the Moon on July 21, 1969, during the Apollo 11 mission.' },
    { question: 'What does NASA stand for?',                   options: ['National Aeronautics and Space Administration', 'National Aerospace Science Agency', 'North American Space Authority', 'National Aviation and Space Advancement'], answer: 0, difficulty: 'medium', category: 'science', explanation: 'NASA was established in 1958 as the US government\'s civilian space agency.' },
    { question: 'Which country has the longest coastline in the world?', options: ['Russia', 'Australia', 'Norway', 'Canada'], answer: 3, difficulty: 'hard', category: 'geography', explanation: 'Canada\'s coastline stretches over 202,000 km, including its islands, the longest in the world.' },
    { question: 'The Pyramids of Giza are located in which country?', options: ['Jordan', 'Libya', 'Egypt', 'Sudan'],       answer: 2, difficulty: 'easy',   category: 'history',      explanation: 'The Great Pyramids of Giza are on the Giza plateau near Cairo, Egypt.' },
    { question: 'What language has the most native speakers?', options: ['English', 'Spanish', 'Hindi', 'Mandarin Chinese'], answer: 3, difficulty: 'medium', category: 'culture',   explanation: 'Mandarin Chinese has over 900 million native speakers, making it the most spoken first language.' },
    { question: 'How many strings does a standard violin have?', options: ['3', '4', '5', '6'],                            answer: 1, difficulty: 'medium', category: 'music',        explanation: 'A standard violin has 4 strings tuned to G, D, A, and E.' }
  ];

  // ─── Uganda Quiz Questions ──────────────────────────────────────────────────
  const ugandaQuestions = [
    { question: 'What is Uganda\'s nickname?',              options: ['The Heart of Africa', 'The Pearl of Africa', 'The Jewel of Africa', 'The Soul of Africa'], answer: 1, difficulty: 'easy',   category: 'geography', funFact: 'Winston Churchill coined this phrase in 1907!' },
    { question: 'Which famous river has its source in Uganda?', options: ['River Thames', 'River Congo', 'River Nile', 'River Niger'], answer: 2, difficulty: 'easy', category: 'geography', funFact: 'Lake Victoria is the source of the White Nile!' },
    { question: 'How many countries border Uganda?',        options: ['3', '4', '5', '6'],                                answer: 2, difficulty: 'medium', category: 'geography', funFact: 'Kenya, Tanzania, Rwanda, DRC, and South Sudan' },
    { question: 'What is Uganda\'s national dish?',         options: ['Ugali', 'Matoke', 'Posho', 'Rolex'],               answer: 1, difficulty: 'easy',   category: 'culture',   funFact: 'Matoke is green bananas cooked savory!' },
    { question: 'What is a \'Rolex\' in Uganda?',           options: ['An expensive watch', 'A type of dance', 'A rolled chapati with eggs', 'A traditional ceremony'], answer: 2, difficulty: 'easy', category: 'culture', funFact: 'Name comes from \'rolled eggs\'!' },
    { question: 'How many official languages does Uganda have?', options: ['1 (English only)', '2 (English and Swahili)', '3', 'Over 40'], answer: 1, difficulty: 'medium', category: 'culture', funFact: 'Over 40 indigenous languages are spoken!' },
    { question: 'When did Uganda gain independence from Britain?', options: ['1960', '1962', '1964', '1966'],              answer: 1, difficulty: 'easy',   category: 'history',   funFact: 'Celebrated 60th anniversary in 2022!' },
    { question: 'How many Ugandan Asians came to the UK in 1972?', options: ['15,000', '27,000', '35,000', '50,000'],    answer: 1, difficulty: 'medium', category: 'history',   funFact: 'They became one of Britain\'s most successful communities!' },
    { question: 'Which UK politician of Ugandan heritage was Home Secretary?', options: ['Sajid Javid', 'Priti Patel', 'Rishi Sunak', 'Kwasi Kwarteng'], answer: 1, difficulty: 'hard', category: 'history', funFact: 'First person of Ugandan-Indian heritage in this role!' },
    { question: 'Who won Uganda\'s Olympic gold at 2012 London Olympics?', options: ['Joshua Cheptegei', 'Stephen Kiprotich', 'Moses Kipsiro', 'John Akii-Bua'], answer: 1, difficulty: 'medium', category: 'sports', funFact: 'Won the marathon - Uganda\'s first gold since 1972!' },
    { question: 'What is Uganda\'s national football team nicknamed?', options: ['The Lions', 'The Cranes', 'The Eagles', 'The Warriors'], answer: 1, difficulty: 'easy', category: 'sports', funFact: 'Named after Uganda\'s national bird, the Crested Crane!' },
    { question: 'Which endangered species lives in Uganda\'s Bwindi Park?', options: ['White rhinos', 'Mountain gorillas', 'Snow leopards', 'Giant pandas'], answer: 1, difficulty: 'easy', category: 'wildlife', funFact: 'Uganda has half the world\'s mountain gorillas!' },
    { question: 'What is Uganda\'s most famous national park?', options: ['Queen Elizabeth', 'Murchison Falls', 'Bwindi', 'Kidepo'], answer: 0, difficulty: 'medium', category: 'wildlife', funFact: 'Named after Queen Elizabeth II!' },
    { question: 'What is Uganda\'s main export crop?',      options: ['Tea', 'Coffee', 'Cotton', 'Tobacco'],              answer: 1, difficulty: 'easy',   category: 'economy',   funFact: 'Africa\'s second-largest coffee producer!' },
    { question: 'What is Uganda\'s currency?',              options: ['Dollar', 'Pound', 'Shilling', 'Franc'],            answer: 2, difficulty: 'easy',   category: 'economy',   explanation: 'The Ugandan Shilling (UGX) has been Uganda\'s official currency since 1966.' },
    { question: 'What time zone is Uganda compared to UK?', options: ['Same', '2 hours ahead', '3 hours ahead', '1 hour ahead'], answer: 2, difficulty: 'medium', category: 'general', explanation: 'Uganda is in the East Africa Time zone (EAT), which is UTC+3, three hours ahead of the UK (UTC+0).' },
    { question: 'What does \'Oli otya\' mean in English?', options: ['Good morning', 'How are you?', 'Welcome', 'Thank you'], answer: 1, difficulty: 'medium', category: 'culture', funFact: 'This is in Luganda language!' },
    { question: 'Which British explorer \'discovered\' the Nile\'s source?', options: ['Livingstone', 'Stanley', 'John Speke', 'Burton'], answer: 2, difficulty: 'medium', category: 'history', funFact: 'Local people knew this for centuries!' },
    { question: 'What does red represent on Uganda\'s flag?', options: ['Blood of martyrs', 'Brotherhood of man', 'African soil', 'Independence struggle'], answer: 1, difficulty: 'medium', category: 'culture', explanation: 'The three colours of Uganda\'s flag are black (the African people), yellow (the sunshine), and red (brotherhood).' },
    { question: 'Which traditional instrument is from Uganda?', options: ['Djembe', 'Adungu', 'Kora', 'Talking drum'], answer: 1, difficulty: 'hard', category: 'culture', funFact: 'It\'s a harp-like instrument with 8-10 strings!' },
    { question: 'What is the population of Uganda approximately?', options: ['25 million', '35 million', '45 million', '55 million'], answer: 2, difficulty: 'medium', category: 'geography', explanation: 'Uganda\'s population is approximately 45–48 million (2024 estimate), making it one of Africa\'s most populous nations.' },
    { question: 'Which city is Uganda\'s second largest after Kampala?', options: ['Entebbe', 'Gulu', 'Jinja', 'Mbarara'], answer: 2, difficulty: 'hard', category: 'geography', explanation: 'Jinja, located at the source of the Nile on the shores of Lake Victoria, is Uganda\'s second largest city.' },
    { question: 'What is Uganda\'s highest mountain peak?',  options: ['Mount Elgon', 'Mount Kenya', 'Margherita Peak (Rwenzori)', 'Mount Moroto'], answer: 2, difficulty: 'hard', category: 'geography', funFact: 'Margherita Peak on the Rwenzori Mountains stands at 5,109m above sea level.' },
    { question: 'What year did Idi Amin seize power in Uganda?', options: ['1969', '1971', '1973', '1975'], answer: 1, difficulty: 'medium', category: 'history', explanation: 'Idi Amin seized power in a military coup on January 25, 1971, overthrowing President Milton Obote.' },
    { question: 'Which lake in Uganda is the second deepest in Africa?', options: ['Lake Victoria', 'Lake Albert', 'Lake George', 'Lake Edward'], answer: 1, difficulty: 'hard', category: 'geography', explanation: 'Lake Albert (also known as Lake Mobutu) is one of the deepest lakes in Uganda, though Lake Tanganyika is the actual second deepest in Africa.' }
  ];

  // ─── History Questions ──────────────────────────────────────────────────────
  const historyQuestions = [
    { question: 'In which year did World War II end?',              options: ['1943', '1945', '1947', '1950'],           answer: 1, difficulty: 'easy',   category: 'history', funFact: 'World War II officially ended on September 2, 1945, with Japan\'s formal surrender.' },
    { question: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'], answer: 1, difficulty: 'easy', category: 'history', explanation: 'George Washington served as the first US President from 1789 to 1797.' },
    { question: 'The Roman Empire fell in which century?',          options: ['3rd century', '5th century', '7th century', '9th century'], answer: 1, difficulty: 'medium', category: 'history', funFact: 'The Western Roman Empire fell in 476 AD.' },
    { question: 'Which ancient wonder is the only one still standing?', options: ['Hanging Gardens of Babylon', 'Great Pyramid of Giza', 'Colossus of Rhodes', 'Lighthouse of Alexandria'], answer: 1, difficulty: 'easy', category: 'history', explanation: 'The Great Pyramid of Giza, built around 2560 BC, is the only ancient wonder still intact today.' },
    { question: 'The French Revolution began in which year?',       options: ['1776', '1789', '1804', '1815'],           answer: 1, difficulty: 'medium', category: 'history', explanation: 'The French Revolution began in 1789 with the storming of the Bastille on July 14.' },
    { question: 'Who was the first woman to win a Nobel Prize?',    options: ['Marie Curie', 'Mother Teresa', 'Jane Addams', 'Rosalind Franklin'], answer: 0, difficulty: 'medium', category: 'history', funFact: 'Marie Curie won the Nobel Prize in Physics in 1903 and Chemistry in 1911.' },
    { question: 'The Berlin Wall fell in which year?',              options: ['1987', '1989', '1991', '1993'],           answer: 1, difficulty: 'easy',   category: 'history', explanation: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War division of Germany.' },
    { question: 'Which civilization built Machu Picchu?',           options: ['Aztecs', 'Mayans', 'Incas', 'Olmecs'],   answer: 2, difficulty: 'medium', category: 'history', explanation: 'The Inca civilization built Machu Picchu around 1450 AD in the Andes mountains of Peru.' },
    { question: 'The Magna Carta was signed in which year?',        options: ['1066', '1215', '1492', '1776'],           answer: 1, difficulty: 'medium', category: 'history', explanation: 'King John of England signed the Magna Carta on June 15, 1215, limiting royal power.' },
    { question: 'Who was known as the \'Iron Lady\'?',              options: ['Margaret Thatcher', 'Golda Meir', 'Indira Gandhi', 'Angela Merkel'], answer: 0, difficulty: 'easy', category: 'history', explanation: 'Margaret Thatcher, UK Prime Minister 1979–1990, earned the nickname "Iron Lady" for her uncompromising politics.' },
    { question: 'The Industrial Revolution began in which country?', options: ['France', 'Germany', 'United States', 'Great Britain'], answer: 3, difficulty: 'easy', category: 'history', explanation: 'The Industrial Revolution began in Great Britain in the mid-18th century, driven by textile manufacturing and steam power.' },
    { question: 'Which empire was ruled by Julius Caesar?',         options: ['Greek Empire', 'Roman Empire', 'Persian Empire', 'Ottoman Empire'], answer: 1, difficulty: 'easy', category: 'history', explanation: 'Julius Caesar was a Roman general and statesman who played a key role in transforming the Roman Republic.' },
    { question: 'The United Nations was founded in which year?',    options: ['1918', '1939', '1945', '1950'],           answer: 2, difficulty: 'medium', category: 'history', explanation: 'The United Nations was founded on October 24, 1945, following World War II, to maintain international peace.' },
    { question: 'Who painted the ceiling of the Sistine Chapel?',   options: ['Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Donatello'], answer: 2, difficulty: 'easy', category: 'history', explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512 at the commission of Pope Julius II.' },
    { question: 'The American Civil War ended in which year?',      options: ['1861', '1863', '1865', '1867'],           answer: 2, difficulty: 'medium', category: 'history', explanation: 'The American Civil War ended in April 1865 with Confederate General Lee\'s surrender at Appomattox.' },
    { question: 'In which year did World War I begin?',             options: ['1912', '1914', '1916', '1918'],           answer: 1, difficulty: 'easy',   category: 'history', explanation: 'World War I began on July 28, 1914, triggered by the assassination of Archduke Franz Ferdinand.' },
    { question: 'Who was the first Emperor of a unified China?',    options: ['Sun Tzu', 'Confucius', 'Qin Shi Huang', 'Kublai Khan'], answer: 2, difficulty: 'hard', category: 'history', explanation: 'Qin Shi Huang unified China in 221 BC and became its first emperor, also beginning construction of the Great Wall.' },
    { question: 'Which country was the first to give women the right to vote?', options: ['USA', 'UK', 'New Zealand', 'Australia'], answer: 2, difficulty: 'hard', category: 'history', explanation: 'New Zealand became the first country to grant women the right to vote in 1893.' },
    { question: 'What was the name of the first artificial satellite?', options: ['Explorer 1', 'Vostok 1', 'Sputnik 1', 'Apollo 1'], answer: 2, difficulty: 'medium', category: 'history', explanation: 'The Soviet Union launched Sputnik 1 on October 4, 1957, the world\'s first artificial satellite.' },
    { question: 'The Renaissance period is most associated with which country?', options: ['Spain', 'France', 'Italy', 'England'], answer: 2, difficulty: 'medium', category: 'history', explanation: 'The Renaissance (14th–17th century) began in Italy, particularly Florence, before spreading across Europe.' },
    { question: 'Who wrote the Communist Manifesto?',               options: ['Lenin and Stalin', 'Marx and Engels', 'Trotsky and Lenin', 'Engels and Bismarck'], answer: 1, difficulty: 'medium', category: 'history', explanation: 'Karl Marx and Friedrich Engels co-wrote the Communist Manifesto, published in February 1848.' },
    { question: 'Which pharaoh is the Sphinx of Giza most likely associated with?', options: ['Ramesses II', 'Tutankhamun', 'Khafre', 'Khufu'], answer: 2, difficulty: 'hard', category: 'history', explanation: 'Most Egyptologists believe the Great Sphinx was built by Pharaoh Khafre around 2500 BC.' },
    { question: 'The Aztec civilisation was conquered by which Spanish explorer?', options: ['Francisco Pizarro', 'Hernán Cortés', 'Christopher Columbus', 'Ferdinand Magellan'], answer: 1, difficulty: 'hard', category: 'history', explanation: 'Hernán Cortés conquered the Aztec Empire between 1519 and 1521, ending Aztec rule in Mexico.' },
    { question: 'Who was the last Tsar of Russia?',                 options: ['Alexander III', 'Nicholas II', 'Alexander II', 'Peter the Great'], answer: 1, difficulty: 'medium', category: 'history', explanation: 'Nicholas II was the last Russian Tsar, abdicating in 1917 during the Russian Revolution.' },
    { question: 'The Hundred Years\' War was fought between which two countries?', options: ['England and Spain', 'France and Spain', 'England and France', 'England and Scotland'], answer: 2, difficulty: 'hard', category: 'history', explanation: 'The Hundred Years\' War (1337–1453) was a series of conflicts between England and France over the French throne.' }
  ];


  // ─── Geography Questions ────────────────────────────────────────────────────
  const geographyQuestions = [
    { question: 'What is the capital of Australia?',               options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2, difficulty: 'medium', category: 'geography', funFact: 'Many people think Sydney is the capital, but it\'s actually Canberra!' },
    { question: 'Which is the longest river in the world?',        options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'], answer: 1, difficulty: 'easy', category: 'geography', explanation: 'The Nile River stretches approximately 6,650 km (4,130 miles) through northeastern Africa.' },
    { question: 'Mount Everest is located in which mountain range?', options: ['Alps', 'Rockies', 'Andes', 'Himalayas'],  answer: 3, difficulty: 'easy', category: 'geography', explanation: 'Mount Everest is the highest peak in the Himalayas, on the border of Nepal and Tibet.' },
    { question: 'Which country has the most natural lakes?',       options: ['United States', 'Russia', 'Canada', 'Brazil'], answer: 2, difficulty: 'hard', category: 'geography', funFact: 'Canada has over 2 million lakes!' },
    { question: 'The Sahara Desert is located on which continent?', options: ['Asia', 'Africa', 'Australia', 'South America'], answer: 1, difficulty: 'easy', category: 'geography', explanation: 'The Sahara is the world\'s largest hot desert, covering most of North Africa.' },
    { question: 'Which ocean is the smallest?',                    options: ['Indian Ocean', 'Atlantic Ocean', 'Arctic Ocean', 'Southern Ocean'], answer: 2, difficulty: 'medium', category: 'geography', explanation: 'The Arctic Ocean is the smallest and shallowest of the five world oceans.' },
    { question: 'How many countries are in Africa?',               options: ['48', '52', '54', '58'],                    answer: 2, difficulty: 'hard', category: 'geography', explanation: 'Africa has 54 recognised countries, making it the continent with the most nations.' },
    { question: 'Which country is known as the Land of the Rising Sun?', options: ['China', 'Japan', 'Thailand', 'South Korea'], answer: 1, difficulty: 'easy', category: 'geography', explanation: 'Japan\'s name in Japanese, "Nihon" or "Nippon", means "origin of the sun".' },
    { question: 'The Amazon Rainforest is primarily in which country?', options: ['Colombia', 'Peru', 'Brazil', 'Venezuela'], answer: 2, difficulty: 'easy', category: 'geography', explanation: 'About 60% of the Amazon Rainforest lies within Brazil; it is the world\'s largest tropical rainforest.' },
    { question: 'Which is the smallest country in the world?',     options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], answer: 1, difficulty: 'easy', category: 'geography', funFact: 'Vatican City is only 0.17 square miles!' },
    { question: 'The Great Barrier Reef is off the coast of which country?', options: ['Indonesia', 'Philippines', 'Australia', 'New Zealand'], answer: 2, difficulty: 'easy', category: 'geography', explanation: 'The Great Barrier Reef lies off the coast of Queensland, Australia, and is the world\'s largest coral reef system.' },
    { question: 'Which country has the most islands?',             options: ['Philippines', 'Indonesia', 'Sweden', 'Norway'], answer: 2, difficulty: 'hard', category: 'geography', funFact: 'Sweden has approximately 267,570 islands!' },
    { question: 'The Eiffel Tower is located in which city?',      options: ['London', 'Paris', 'Rome', 'Berlin'],       answer: 1, difficulty: 'easy', category: 'geography', explanation: 'The Eiffel Tower was built on the Champ de Mars in Paris, France, completed in 1889.' },
    { question: 'Which desert is the driest place on Earth?',      options: ['Sahara Desert', 'Gobi Desert', 'Atacama Desert', 'Arabian Desert'], answer: 2, difficulty: 'medium', category: 'geography', explanation: 'The Atacama Desert in South America receives less than 1mm of rain per year in some areas.' },
    { question: 'What is the largest island in the world?',        options: ['Madagascar', 'Greenland', 'New Guinea', 'Borneo'], answer: 1, difficulty: 'medium', category: 'geography', explanation: 'Greenland is the world\'s largest island at 2.166 million km², though it is largely ice-covered.' },
    { question: 'What is the capital of Canada?',                  options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], answer: 3, difficulty: 'medium', category: 'geography', explanation: 'Ottawa has been Canada\'s capital since 1857, chosen for its position on the Ontario–Quebec border.' },
    { question: 'Which city is known as the "City of Light"?',     options: ['Rome', 'London', 'Paris', 'Vienna'],       answer: 2, difficulty: 'easy', category: 'geography', explanation: 'Paris earned the nickname "City of Light" (La Ville Lumière) for being an early adopter of gas street lighting and a centre of Enlightenment.' },
    { question: 'What is the highest waterfall in the world?',     options: ['Niagara Falls', 'Victoria Falls', 'Angel Falls', 'Iguazu Falls'], answer: 2, difficulty: 'hard', category: 'geography', explanation: 'Angel Falls in Venezuela drops 979 metres (3,212 ft), making it the world\'s highest uninterrupted waterfall.' },
    { question: 'Which country is situated on both the European and Asian continents?', options: ['Georgia', 'Kazakhstan', 'Turkey', 'Russia'], answer: 3, difficulty: 'medium', category: 'geography', explanation: 'Russia spans both Europe and Asia; it has the largest land area of any country in both continents.' },
    { question: 'The "Ring of Fire" is located in which ocean?',   options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], answer: 2, difficulty: 'easy', category: 'geography', explanation: 'The Ring of Fire is a 40,000 km horseshoe around the Pacific Ocean where most of Earth\'s volcanic activity occurs.' },
    { question: 'What is the capital of Brazil?',                  options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], answer: 2, difficulty: 'medium', category: 'geography', explanation: 'Brasília replaced Rio de Janeiro as Brazil\'s capital in 1960; it was purpose-built in the country\'s interior.' },
    { question: 'Which sea is the saltiest body of water on Earth?', options: ['Red Sea', 'Mediterranean Sea', 'Dead Sea', 'Caspian Sea'], answer: 2, difficulty: 'medium', category: 'geography', explanation: 'The Dead Sea has a salinity of about 34%, nearly 10 times saltier than the ocean, allowing people to float effortlessly.' },
    { question: 'What is the longest mountain range in the world?', options: ['Himalayas', 'Rockies', 'Alps', 'Andes'],  answer: 3, difficulty: 'medium', category: 'geography', explanation: 'The Andes stretch approximately 7,000 km along the western coast of South America, making them the longest continental range.' },
    { question: 'Which country has the largest population?',       options: ['USA', 'India', 'China', 'Indonesia'],      answer: 1, difficulty: 'medium', category: 'geography', explanation: 'India surpassed China in 2023 to become the world\'s most populous country, with over 1.4 billion people.' },
    { question: 'In which country is the ancient city of Petra located?', options: ['Egypt', 'Israel', 'Jordan', 'Saudi Arabia'], answer: 2, difficulty: 'hard', category: 'geography', explanation: 'Petra is a famous archaeological city in southern Jordan, carved into rose-red sandstone cliffs by the Nabataeans.' }
  ];

  // ─── Science Questions ──────────────────────────────────────────────────────
  const scienceQuestions = [
    { question: 'What is the chemical symbol for water?',          options: ['H2O', 'CO2', 'O2', 'HO'],                 answer: 0, difficulty: 'easy',   category: 'science', explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, giving it the formula H₂O.' },
    { question: 'Which planet is known as the Red Planet?',        options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],      answer: 1, difficulty: 'easy',   category: 'science', explanation: 'Mars appears red because of iron oxide (rust) on its surface and in its thin atmosphere.' },
    { question: 'What is the speed of light?',                     options: ['299,792 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s'], answer: 0, difficulty: 'medium', category: 'science', funFact: 'Light travels at approximately 299,792 kilometres per second!' },
    { question: 'How many bones are in the adult human body?',     options: ['186', '206', '226', '246'],                answer: 1, difficulty: 'medium', category: 'science', explanation: 'An adult human body has 206 bones; babies are born with around 270–300 bones that fuse as they grow.' },
    { question: 'What is the largest organ in the human body?',    options: ['Liver', 'Brain', 'Heart', 'Skin'],         answer: 3, difficulty: 'easy',   category: 'science', explanation: 'The skin is the body\'s largest organ, covering about 2 square metres and accounting for roughly 15% of body weight.' },
    { question: 'Which element has the atomic number 1?',          options: ['Helium', 'Hydrogen', 'Oxygen', 'Carbon'],  answer: 1, difficulty: 'easy',   category: 'science', explanation: 'Hydrogen is the lightest and most abundant element in the universe, with one proton in its nucleus.' },
    { question: 'What is the centre of an atom called?',           options: ['Electron', 'Proton', 'Nucleus', 'Neutron'], answer: 2, difficulty: 'easy', category: 'science', explanation: 'The nucleus is the dense core of an atom, containing protons and neutrons; electrons orbit around it.' },
    { question: 'How many planets are in our solar system?',       options: ['7', '8', '9', '10'],                       answer: 1, difficulty: 'easy',   category: 'science', funFact: 'Pluto was reclassified as a dwarf planet in 2006.' },
    { question: 'What gas do plants absorb from the atmosphere?',  options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2, difficulty: 'easy', category: 'science', explanation: 'Plants absorb CO₂ in photosynthesis, using sunlight to convert it into glucose and oxygen.' },
    { question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'],     answer: 2, difficulty: 'easy',   category: 'science', explanation: 'Diamond scores 10 on the Mohs hardness scale — the maximum — and is a form of pure carbon.' },
    { question: 'Who developed the theory of relativity?',         options: ['Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Stephen Hawking'], answer: 1, difficulty: 'easy', category: 'science', explanation: 'Albert Einstein published his special theory of relativity in 1905 and general relativity in 1915.' },
    { question: 'What is the boiling point of water in Celsius?',  options: ['90°C', '100°C', '110°C', '120°C'],        answer: 1, difficulty: 'easy',   category: 'science', explanation: 'Water boils at 100°C (212°F) at standard atmospheric pressure (1 atm / sea level).' },
    { question: 'How many chromosomes do humans have?',            options: ['23', '46', '48', '52'],                    answer: 1, difficulty: 'medium', category: 'science', explanation: 'Humans have 46 chromosomes arranged in 23 pairs; one set from each parent.' },
    { question: 'What type of animal is a dolphin?',               options: ['Fish', 'Amphibian', 'Mammal', 'Reptile'],  answer: 2, difficulty: 'easy',   category: 'science', explanation: 'Dolphins are marine mammals — they breathe air, are warm-blooded, and nurse their young.' },
    { question: 'What is the smallest unit of life?',              options: ['Atom', 'Molecule', 'Cell', 'Tissue'],      answer: 2, difficulty: 'medium', category: 'science', explanation: 'The cell is the fundamental unit of life; all living organisms are made of one or more cells.' },
    { question: 'Which gas makes up most of Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Argon', 'Nitrogen'], answer: 3, difficulty: 'easy', category: 'science', explanation: 'Nitrogen (N₂) makes up about 78% of Earth\'s atmosphere, followed by oxygen at about 21%.' },
    { question: 'What is the "powerhouse of the cell"?',           options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Vacuole'], answer: 2, difficulty: 'medium', category: 'science', explanation: 'Mitochondria generate most of the cell\'s ATP (adenosine triphosphate), which is used as energy currency.' },
    { question: 'How many chambers does the human heart have?',    options: ['2', '3', '4', '5'],                        answer: 2, difficulty: 'easy',   category: 'science', explanation: 'The human heart has four chambers: two upper atria and two lower ventricles.' },
    { question: 'What causes a rainbow?',                          options: ['Reflection only', 'Refraction of light through water droplets', 'Static electricity', 'Heat haze'], answer: 1, difficulty: 'medium', category: 'science', explanation: 'Rainbows are caused by sunlight being refracted (bent), dispersed, and reflected inside water droplets in the atmosphere.' },
    { question: 'What is the chemical symbol for iron?',           options: ['Ir', 'In', 'Fe', 'Io'],                   answer: 2, difficulty: 'medium', category: 'science', explanation: 'Fe comes from the Latin word "Ferrum" meaning iron.' },
    { question: 'Approximately how long does light take to travel from the Sun to Earth?', options: ['8 seconds', '8 minutes', '8 hours', '8 days'], answer: 1, difficulty: 'medium', category: 'science', explanation: 'Light travels at 299,792 km/s and covers the ~150 million km to Earth in about 8 minutes and 20 seconds.' },
    { question: 'What is the most common blood type globally?',    options: ['A+', 'B+', 'AB+', 'O+'],                  answer: 3, difficulty: 'medium', category: 'science', explanation: 'O+ is the most common blood type worldwide, found in approximately 38–40% of people.' },
    { question: 'How many teeth does a healthy adult human have?', options: ['28', '30', '32', '34'],                   answer: 2, difficulty: 'medium', category: 'science', explanation: 'Adults have 32 teeth including 4 wisdom teeth (third molars), though many people have these removed.' },
    { question: 'What phenomenon explains why the sky appears blue?', options: ['Absorption by water vapour', 'Rayleigh scattering of sunlight', 'Reflection from the ocean', 'Ozone layer colour'], answer: 1, difficulty: 'hard', category: 'science', explanation: 'Rayleigh scattering causes shorter blue wavelengths of sunlight to scatter more than other colours, making the sky appear blue.' },
    { question: 'What is absolute zero on the Celsius scale?',     options: ['-100°C', '-173°C', '-273°C', '-373°C'],   answer: 2, difficulty: 'hard',   category: 'science', explanation: 'Absolute zero is −273.15°C (0 Kelvin), the coldest possible temperature where all molecular motion stops.' }
  ];

  // ─── Entertainment Questions ────────────────────────────────────────────────
  const entertainmentQuestions = [
    { question: 'Who directed the movie \'Titanic\'?',             options: ['Steven Spielberg', 'James Cameron', 'Christopher Nolan', 'Martin Scorsese'], answer: 1, difficulty: 'medium', category: 'entertainment', explanation: 'James Cameron wrote and directed Titanic (1997), which won 11 Academy Awards.' },
    { question: 'Which band sang \'Bohemian Rhapsody\'?',          options: ['The Beatles', 'Led Zeppelin', 'Queen', 'Pink Floyd'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Queen released Bohemian Rhapsody in 1975; it was written by lead singer Freddie Mercury.' },
    { question: 'Who played Iron Man in the Marvel Cinematic Universe?', options: ['Chris Evans', 'Chris Hemsworth', 'Robert Downey Jr.', 'Mark Ruffalo'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Robert Downey Jr. played Tony Stark / Iron Man from 2008 to 2019 across multiple MCU films.' },
    { question: 'Which TV show features the characters Rachel, Ross, and Monica?', options: ['Friends', 'How I Met Your Mother', 'The Big Bang Theory', 'Seinfeld'], answer: 0, difficulty: 'easy', category: 'entertainment', explanation: 'Friends (1994–2004) followed six friends in New York City, with Rachel, Ross, Monica, Chandler, Joey, and Phoebe.' },
    { question: 'Who sang \'Thriller\'?',                          options: ['Prince', 'Michael Jackson', 'Elvis Presley', 'Madonna'], answer: 1, difficulty: 'easy', category: 'entertainment', funFact: 'Thriller is the best-selling album of all time!' },
    { question: 'Which movie won the Oscar for Best Picture in 2020?', options: ['Joker', '1917', 'Parasite', 'Once Upon a Time in Hollywood'], answer: 2, difficulty: 'hard', category: 'entertainment', explanation: 'Parasite (2019) by Bong Joon-ho became the first non-English-language film to win Best Picture.' },
    { question: 'Who is known as the \'King of Pop\'?',            options: ['Elvis Presley', 'Prince', 'Michael Jackson', 'Justin Timberlake'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Michael Jackson earned the title "King of Pop" for his global influence on music, dance, and fashion.' },
    { question: 'Which streaming service created \'Stranger Things\'?', options: ['Hulu', 'Amazon Prime', 'Netflix', 'Disney+'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Stranger Things premiered on Netflix in July 2016 and became one of its most watched original series.' },
    { question: 'Who played the character Jack in \'Titanic\'?',   options: ['Brad Pitt', 'Leonardo DiCaprio', 'Tom Cruise', 'Johnny Depp'], answer: 1, difficulty: 'easy', category: 'entertainment', explanation: 'Leonardo DiCaprio played Jack Dawson in Titanic (1997) opposite Kate Winslet.' },
    { question: 'Which movie features the quote \'May the Force be with you\'?', options: ['Star Trek', 'Star Wars', 'Guardians of the Galaxy', 'Avatar'], answer: 1, difficulty: 'easy', category: 'entertainment', explanation: 'Star Wars (1977) by George Lucas introduced this iconic phrase, which has become part of popular culture.' },
    { question: 'Who is the author of the Harry Potter series?',   options: ['J.R.R. Tolkien', 'C.S. Lewis', 'J.K. Rowling', 'George R.R. Martin'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'J.K. Rowling published Harry Potter and the Philosopher\'s Stone in 1997, launching the iconic series.' },
    { question: 'Which animated movie features the song \'Let It Go\'?', options: ['Moana', 'Tangled', 'Frozen', 'Brave'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Let It Go was performed by Idina Menzel as Elsa in Disney\'s Frozen (2013).' },
    { question: 'Who played Wolverine in the X-Men movies?',       options: ['Hugh Jackman', 'Ryan Reynolds', 'Chris Pratt', 'Tom Hardy'], answer: 0, difficulty: 'easy', category: 'entertainment', explanation: 'Hugh Jackman played Wolverine / Logan from 2000 to 2017, a record-breaking 17 years in the same superhero role.' },
    { question: 'Which music video was the first to reach 1 billion views on YouTube?', options: ['Despacito', 'Gangnam Style', 'Baby', 'See You Again'], answer: 1, difficulty: 'hard', category: 'entertainment', explanation: 'PSY\'s Gangnam Style reached 1 billion YouTube views in December 2012, the first video to do so.' },
    { question: 'Who won the first season of American Idol?',      options: ['Carrie Underwood', 'Kelly Clarkson', 'Jennifer Hudson', 'Adam Lambert'], answer: 1, difficulty: 'medium', category: 'entertainment', explanation: 'Kelly Clarkson won the first season of American Idol in 2002 and went on to become a Grammy-winning artist.' },
    { question: 'Who played Walter White in Breaking Bad?',         options: ['Bob Odenkirk', 'Aaron Paul', 'Bryan Cranston', 'Dean Norris'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Bryan Cranston played chemistry teacher turned drug kingpin Walter White, winning four Emmy Awards for the role.' },
    { question: 'What year was the first iPhone released?',         options: ['2005', '2006', '2007', '2008'],             answer: 2, difficulty: 'medium', category: 'entertainment', explanation: 'Apple\'s first iPhone was announced by Steve Jobs on January 9, 2007, and went on sale June 29, 2007.' },
    { question: 'Which was the first fully computer-animated feature film?', options: ['A Bug\'s Life', 'Finding Nemo', 'Shrek', 'Toy Story'], answer: 3, difficulty: 'medium', category: 'entertainment', explanation: 'Toy Story (1995), produced by Pixar and Disney, was the world\'s first fully computer-animated feature film.' },
    { question: 'Who sang "Shape of You"?',                        options: ['Sam Smith', 'Justin Bieber', 'Ed Sheeran', 'Shawn Mendes'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Ed Sheeran released "Shape of You" in January 2017; it became one of the best-selling singles of all time.' },
    { question: 'Which superhero is also known as "The Dark Knight"?', options: ['Superman', 'Spider-Man', 'Batman', 'Iron Man'], answer: 2, difficulty: 'easy', category: 'entertainment', explanation: 'Batman is nicknamed "The Dark Knight" due to his dark costume, brooding personality, and night-time crime fighting.' },
    { question: 'What is the longest-running animated TV show?',   options: ['Family Guy', 'South Park', 'The Simpsons', 'Futurama'], answer: 2, difficulty: 'medium', category: 'entertainment', explanation: 'The Simpsons, created by Matt Groening, premiered in 1989 and remains the longest-running animated primetime series.' },
    { question: 'Which artist has won the most Grammy Awards overall?', options: ['Jay-Z', 'Beyoncé', 'Taylor Swift', 'Adele'], answer: 1, difficulty: 'hard', category: 'entertainment', explanation: 'Beyoncé holds the record for the most Grammy wins by any artist, surpassing 32 awards as of 2024.' },
    { question: 'In which fictional universe does "Hogwarts" exist?', options: ['The Hunger Games', 'Harry Potter', 'Narnia', 'The Lord of the Rings'], answer: 1, difficulty: 'easy', category: 'entertainment', explanation: 'Hogwarts School of Witchcraft and Wizardry is the fictional boarding school in J.K. Rowling\'s Harry Potter universe.' },
    { question: 'Which Marvel film has grossed the most at the box office?', options: ['Avengers: Infinity War', 'Black Panther', 'Avengers: Endgame', 'Spider-Man: No Way Home'], answer: 2, difficulty: 'medium', category: 'entertainment', explanation: 'Avengers: Endgame (2019) grossed $2.798 billion worldwide, making it the second highest-grossing film ever.' },
    { question: 'Who voiced Simba in the original 1994 Lion King?', options: ['Will Smith', 'James Earl Jones', 'Matthew Broderick', 'Chiwetel Ejiofor'], answer: 2, difficulty: 'medium', category: 'entertainment', explanation: 'Matthew Broderick voiced adult Simba in The Lion King (1994); James Earl Jones voiced his father Mufasa.' }
  ];

  // ─── Technology & Computing Questions ──────────────────────────────────────
  const technologyQuestions = [
    { question: 'What does CPU stand for?',                         options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], answer: 0, difficulty: 'easy', category: 'technology', funFact: 'The CPU is often called the "brain" of the computer!' },
    { question: 'Which company co-founded by Steve Jobs made the iPhone?', options: ['Microsoft', 'Google', 'Apple', 'Samsung'], answer: 2, difficulty: 'easy', category: 'technology', explanation: 'Steve Jobs co-founded Apple in 1976; the company launched the revolutionary iPhone in 2007.' },
    { question: 'What does HTML stand for?',                        options: ['HyperText Markup Language', 'High Tech Modern Language', 'HyperText Media Link', 'Home Tool Markup Language'], answer: 0, difficulty: 'easy', category: 'technology', explanation: 'HTML (HyperText Markup Language) is the standard language used to create and structure web pages.' },
    { question: 'Who is considered the father of modern computing?', options: ['Bill Gates', 'Alan Turing', 'Tim Berners-Lee', 'Charles Babbage'], answer: 1, difficulty: 'medium', category: 'technology', funFact: 'Alan Turing\'s work during WWII helped crack the Nazi Enigma code!' },
    { question: 'In what year was the World Wide Web invented?',    options: ['1983', '1989', '1995', '2001'],             answer: 1, difficulty: 'medium', category: 'technology', funFact: 'Tim Berners-Lee invented it at CERN in 1989.' },
    { question: 'How many bits are in one byte?',                   options: ['4', '8', '16', '32'],                      answer: 1, difficulty: 'medium', category: 'technology', explanation: 'A byte consists of 8 bits; this is the standard unit of digital information storage.' },
    { question: 'Which company created the Android operating system?', options: ['Apple', 'Microsoft', 'Google', 'Samsung'], answer: 2, difficulty: 'easy', category: 'technology', explanation: 'Google acquired Android Inc. in 2005 and released the first Android OS version in 2008.' },
    { question: 'What does "USB" stand for?',                       options: ['Universal Serial Bus', 'Ultra Speed Band', 'Unified System Backup', 'Universal Storage Base'], answer: 0, difficulty: 'easy', category: 'technology', explanation: 'USB (Universal Serial Bus) is the standard connection interface for data transfer and charging between devices.' },
    { question: 'Which programming language is most commonly used for web front-end development?', options: ['Python', 'Java', 'JavaScript', 'C++'], answer: 2, difficulty: 'easy', category: 'technology', explanation: 'JavaScript is the only programming language that runs natively in web browsers, making it essential for front-end development.' },
    { question: 'What is the name of Google\'s internet search algorithm?', options: ['WebCrawler', 'PageRank', 'SearchBot', 'NetScan'], answer: 1, difficulty: 'hard', category: 'technology', funFact: 'PageRank was named after Google co-founder Larry Page!' },
    { question: 'What does "AI" stand for?',                        options: ['Automated Interface', 'Artificial Intelligence', 'Advanced Integration', 'Algorithmic Input'], answer: 1, difficulty: 'easy', category: 'technology', explanation: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by computer systems.' },
    { question: 'Which company makes the Windows operating system?', options: ['Apple', 'Google', 'Microsoft', 'IBM'],    answer: 2, difficulty: 'easy', category: 'technology', explanation: 'Microsoft launched Windows 1.0 in 1985; it is now the most widely used desktop operating system.' },
    { question: 'What is the most visited website in the world?',   options: ['Facebook', 'YouTube', 'Google', 'Amazon'], answer: 2, difficulty: 'easy', category: 'technology', explanation: 'Google.com consistently ranks as the most visited website globally, processing over 8.5 billion searches per day.' },
    { question: 'What does "RAM" stand for?',                       options: ['Read Access Memory', 'Random Access Memory', 'Rapid Application Module', 'Remote Access Machine'], answer: 1, difficulty: 'easy', category: 'technology', explanation: 'RAM (Random Access Memory) is a computer\'s short-term memory, storing data currently being used by the CPU.' },
    { question: 'Which social media platform uses a bird as its logo?', options: ['Instagram', 'Twitter / X', 'Facebook', 'LinkedIn'], answer: 1, difficulty: 'easy', category: 'technology', funFact: 'Twitter rebranded to "X" in 2023 under Elon Musk.' },
    { question: 'What does "URL" stand for?',                       options: ['Uniform Resource Locator', 'Universal Reference Link', 'Unified Resource Language', 'User Request Layer'], answer: 0, difficulty: 'medium', category: 'technology', explanation: 'A URL (Uniform Resource Locator) is the web address used to identify a specific resource on the internet.' },
    { question: 'Which programming language was created by Guido van Rossum?', options: ['Ruby', 'Perl', 'Python', 'Swift'], answer: 2, difficulty: 'medium', category: 'technology', explanation: 'Guido van Rossum created Python in 1991; it is now one of the world\'s most popular programming languages.' },
    { question: 'What year was Facebook founded?',                  options: ['2002', '2003', '2004', '2005'],             answer: 2, difficulty: 'medium', category: 'technology', explanation: 'Mark Zuckerberg launched "TheFacebook" from his Harvard dorm room on February 4, 2004.' },
    { question: 'What does "GPU" stand for?',                       options: ['General Processing Unit', 'Graphics Processing Unit', 'Graphical Program Utility', 'Global Processing Unit'], answer: 1, difficulty: 'medium', category: 'technology', explanation: 'A GPU (Graphics Processing Unit) is a specialised processor designed to accelerate graphics rendering and parallel computing.' },
    { question: 'What does "Wi-Fi" stand for?',                     options: ['Wireless Fidelity', 'Wide Frequency', 'Wireless Frequency Interface', 'Web Interface'], answer: 0, difficulty: 'easy', category: 'technology', explanation: 'Wi-Fi stands for Wireless Fidelity, a family of wireless networking technologies based on the IEEE 802.11 standards.' },
    { question: 'How many bytes are in one kilobyte (KB)?',         options: ['512', '1,000', '1,024', '2,048'],           answer: 2, difficulty: 'medium', category: 'technology', explanation: 'One kilobyte = 1,024 bytes (2¹⁰), following binary convention — though some contexts use 1,000 bytes.' },
    { question: 'What does "HTTPS" stand for?',                     options: ['HyperText Transfer Protocol Secure', 'High Transfer Technology Protocol System', 'Hyperlink Text Transfer Protocol Standard', 'Host Transfer Protocol Syntax'], answer: 0, difficulty: 'medium', category: 'technology', explanation: 'HTTPS adds an SSL/TLS encryption layer to HTTP, securing data transmission between browser and server.' },
    { question: 'Which company owns YouTube?',                      options: ['Apple', 'Meta', 'Amazon', 'Google'],       answer: 3, difficulty: 'easy', category: 'technology', explanation: 'Google acquired YouTube in October 2006 for $1.65 billion in stock.' },
    { question: 'What programming language runs inside most web browsers?', options: ['Python', 'Java', 'JavaScript', 'PHP'], answer: 2, difficulty: 'easy', category: 'technology', explanation: 'JavaScript is the only language that runs natively in web browsers without plugins or compilers.' },
    { question: 'Which company created the first commercially successful relational database?', options: ['Microsoft', 'IBM', 'Oracle', 'Sun Microsystems'], answer: 2, difficulty: 'hard', category: 'technology', explanation: 'Oracle Corporation, founded by Larry Ellison in 1977, released the first commercially available relational database in 1979.' }
  ];


  // ─── Sports Questions ───────────────────────────────────────────────────────
  const sportsQuestions = [
    { question: 'How many players are on a standard football (soccer) team?', options: ['9', '10', '11', '12'], answer: 2, difficulty: 'easy', category: 'sports', explanation: 'A standard football team has 11 players on the pitch at a time, including the goalkeeper.' },
    { question: 'In which sport would you perform a slam dunk?',    options: ['Volleyball', 'Basketball', 'Tennis', 'Handball'], answer: 1, difficulty: 'easy', category: 'sports', explanation: 'A slam dunk is a basketball shot where a player jumps and forcefully puts the ball down through the hoop.' },
    { question: 'How many Grand Slam tournaments are there in tennis?', options: ['2', '3', '4', '5'], answer: 2, difficulty: 'easy', category: 'sports', funFact: 'Wimbledon, US Open, French Open, and Australian Open.' },
    { question: 'Which country has won the most FIFA World Cups?',  options: ['Germany', 'Italy', 'Brazil', 'Argentina'], answer: 2, difficulty: 'medium', category: 'sports', funFact: 'Brazil has won 5 World Cups — more than any other nation!' },
    { question: 'In cricket, how many runs constitute a "century"?', options: ['50', '75', '100', '150'], answer: 2, difficulty: 'easy', category: 'sports', explanation: 'A century in cricket is when a batsman scores 100 or more runs in a single innings.' },
    { question: 'The Olympic Games originated in which country?',   options: ['Italy', 'Greece', 'Egypt', 'Turkey'], answer: 1, difficulty: 'easy', category: 'sports', funFact: 'The ancient Olympics began in Olympia, Greece around 776 BC.' },
    { question: 'In golf, what is the term for one shot under par?', options: ['Eagle', 'Birdie', 'Bogey', 'Albatross'], answer: 1, difficulty: 'medium', category: 'sports', explanation: 'A birdie is a score of one under par on a golf hole; two under par is an eagle.' },
    { question: 'How long is a standard marathon race?',            options: ['32.1 km', '40 km', '42.195 km', '45 km'], answer: 2, difficulty: 'medium', category: 'sports', funFact: 'The distance commemorates the Greek messenger who ran from Marathon to Athens!' },
    { question: 'In which sport is the term "love" used to mean zero?', options: ['Badminton', 'Cricket', 'Tennis', 'Golf'], answer: 2, difficulty: 'medium', category: 'sports', explanation: 'In tennis, "love" means zero points. The origin is debated, possibly from the French "l\'oeuf" (egg = zero).' },
    { question: 'Who holds the record for most Olympic gold medals?', options: ['Usain Bolt', 'Carl Lewis', 'Michael Phelps', 'Mark Spitz'], answer: 2, difficulty: 'medium', category: 'sports', funFact: 'Michael Phelps won 23 gold medals across four Olympic Games!' },
    { question: 'Which sport uses a shuttlecock?',                  options: ['Squash', 'Badminton', 'Pickleball', 'Racquetball'], answer: 1, difficulty: 'easy', category: 'sports', explanation: 'A shuttlecock (or birdie) is the feathered projectile used in badminton, designed to fly stably through the air.' },
    { question: 'How many points is a touchdown worth in American Football?', options: ['3', '4', '6', '7'], answer: 2, difficulty: 'easy', category: 'sports', explanation: 'A touchdown scores 6 points in American Football; teams can then attempt a 1-point extra kick or 2-point conversion.' },
    { question: 'Which country hosted the 2016 Summer Olympics?',   options: ['China', 'United Kingdom', 'Brazil', 'Japan'], answer: 2, difficulty: 'easy', category: 'sports', funFact: 'Rio de Janeiro was the first South American city to host the Summer Olympics.' },
    { question: 'In boxing, how many rounds are in a standard professional championship fight?', options: ['10', '12', '15', '20'], answer: 1, difficulty: 'hard', category: 'sports', explanation: 'Modern world championship bouts are 12 rounds; they were reduced from 15 in 1983 following safety concerns.' },
    { question: 'What is the highest possible score with a single dart?', options: ['60', '50', '180', '100'], answer: 0, difficulty: 'hard', category: 'sports', funFact: 'Triple 20 scores 60 points — the highest single dart score!' },
    { question: 'How many periods are in a standard ice hockey game?', options: ['2', '3', '4', '5'], answer: 1, difficulty: 'medium', category: 'sports', explanation: 'An ice hockey game consists of three periods of 20 minutes each, with overtime if tied after regulation.' },
    { question: 'How many holes are in a standard round of golf?',  options: ['9', '12', '18', '24'], answer: 2, difficulty: 'easy', category: 'sports', explanation: 'A standard round of golf consists of 18 holes; the Royal and Ancient Golf Club of St Andrews established this tradition.' },
    { question: 'In a hat-trick, how many goals does a player score?', options: ['2', '3', '4', '5'], answer: 1, difficulty: 'easy', category: 'sports', explanation: 'A hat-trick is when a player scores three goals in a single game, most commonly associated with football and cricket.' },
    { question: 'What does "FIFA" stand for?',                      options: ['Federation of International Football Associations', 'Fédération Internationale de Football Association', 'Foundation of International Football Affiliates', 'Federal International Football Authority'], answer: 1, difficulty: 'hard', category: 'sports', explanation: 'FIFA (Fédération Internationale de Football Association) is the governing body of world football, founded in 1904.' },
    { question: 'How long is an Olympic swimming pool?',            options: ['25 metres', '40 metres', '50 metres', '100 metres'], answer: 2, difficulty: 'medium', category: 'sports', explanation: 'Olympic swimming pools are exactly 50 metres (164 feet) long, with 10 lanes each 2.5 metres wide.' },
    { question: 'In which country was the martial art judo invented?', options: ['China', 'Korea', 'Japan', 'Thailand'], answer: 2, difficulty: 'medium', category: 'sports', explanation: 'Judo was created by Jigoro Kano in Japan in 1882; it became an Olympic sport for men in 1964 at the Tokyo Games.' },
    { question: 'What is the maximum score in a single 10-pin bowling game?', options: ['200', '250', '300', '400'], answer: 2, difficulty: 'hard', category: 'sports', explanation: 'A perfect game in bowling scores 300, achieved by rolling 12 consecutive strikes across 10 frames.' },
    { question: 'How often are the Summer Olympic Games held?',     options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'], answer: 2, difficulty: 'easy', category: 'sports', explanation: 'The Summer Olympics are held every four years, a tradition dating back to the ancient Greek games.' },
    { question: 'Which country invented table tennis (ping-pong)?', options: ['China', 'Japan', 'England', 'USA'], answer: 2, difficulty: 'hard', category: 'sports', explanation: 'Table tennis was invented in England in the 1880s as an after-dinner parlour game; it became an Olympic sport in 1988.' },
    { question: 'In rugby union, how many players are on each team?', options: ['11', '13', '15', '17'], answer: 2, difficulty: 'medium', category: 'sports', explanation: 'Rugby union teams have 15 players each. Rugby league (a different code) uses 13 players per team.' }
  ];

  // ─── Music Questions ────────────────────────────────────────────────────────
  const musicQuestions = [
    { question: 'How many strings does a standard guitar have?',    options: ['4', '5', '6', '7'], answer: 2, difficulty: 'easy', category: 'music', explanation: 'A standard acoustic or electric guitar has 6 strings, typically tuned E-A-D-G-B-e from lowest to highest.' },
    { question: 'Which musician is known as "The King of Rock and Roll"?', options: ['Chuck Berry', 'Little Richard', 'Elvis Presley', 'Jerry Lee Lewis'], answer: 2, difficulty: 'easy', category: 'music', funFact: 'Elvis Presley\'s first single "That\'s All Right" was released in 1954.' },
    { question: 'What does "BPM" stand for in music?',             options: ['Bass Per Measure', 'Beats Per Minute', 'Bars Per Movement', 'Beat Pulse Mode'], answer: 1, difficulty: 'easy', category: 'music', explanation: 'BPM (Beats Per Minute) is the measurement of tempo; a resting heartbeat is about 60–100 BPM.' },
    { question: 'The Beatles were from which city?',               options: ['London', 'Manchester', 'Liverpool', 'Birmingham'], answer: 2, difficulty: 'easy', category: 'music', funFact: 'The Fab Four started out playing at the Cavern Club in Liverpool.' },
    { question: 'How many keys does a standard piano have?',       options: ['72', '76', '88', '96'], answer: 2, difficulty: 'medium', category: 'music', funFact: '88 keys cover over 7 octaves — the full range of the human singing voice.' },
    { question: 'What musical term means to gradually get louder?', options: ['Decrescendo', 'Staccato', 'Crescendo', 'Fermata'], answer: 2, difficulty: 'medium', category: 'music', explanation: 'Crescendo is an Italian musical term meaning to gradually increase in volume, often marked with a < symbol.' },
    { question: 'Which singer performed "Bohemian Rhapsody" with Queen?', options: ['David Bowie', 'Mick Jagger', 'Freddie Mercury', 'Robert Plant'], answer: 2, difficulty: 'easy', category: 'music', explanation: 'Freddie Mercury was the lead vocalist of Queen; he wrote and performed Bohemian Rhapsody in 1975.' },
    { question: 'What does "DJ" stand for?',                       options: ['Digital Jukebox', 'Disc Jockey', 'Dynamic Jazz', 'Dance Judge'], answer: 1, difficulty: 'easy', category: 'music', explanation: 'A Disc Jockey (DJ) plays recorded music for an audience, originally using vinyl records (discs).' },
    { question: 'In which country did reggae music originate?',    options: ['Nigeria', 'Trinidad', 'Jamaica', 'Ghana'], answer: 2, difficulty: 'medium', category: 'music', funFact: 'Reggae evolved from ska and rocksteady in Jamaica in the late 1960s.' },
    { question: 'How many musicians are in a quartet?',            options: ['2', '3', '4', '5'], answer: 2, difficulty: 'easy', category: 'music', explanation: 'A quartet consists of exactly four musicians or singers performing together.' },
    { question: 'Who is known as the "Queen of Pop"?',             options: ['Beyoncé', 'Mariah Carey', 'Madonna', 'Whitney Houston'], answer: 2, difficulty: 'medium', category: 'music', explanation: 'Madonna earned the title "Queen of Pop" through her decades of chart-topping success and cultural influence since the 1980s.' },
    { question: 'What is the world\'s best-selling music album?',  options: ['Back in Black – AC/DC', 'Thriller – Michael Jackson', 'The Dark Side of the Moon – Pink Floyd', 'Eagles: Their Greatest Hits'], answer: 1, difficulty: 'medium', category: 'music', funFact: 'Thriller has sold an estimated 70 million copies worldwide!' },
    { question: 'How many notes are in a standard Western octave?', options: ['6', '7', '8', '12'], answer: 2, difficulty: 'hard', category: 'music', funFact: 'There are 8 notes in the diatonic scale: do, re, mi, fa, sol, la, si, do.' },
    { question: 'Which instrument does Elton John famously play?', options: ['Guitar', 'Violin', 'Piano', 'Saxophone'], answer: 2, difficulty: 'easy', category: 'music', explanation: 'Elton John is renowned for his flamboyant piano playing; he learned to play from age 3 and entered the Royal Academy of Music at 11.' },
    { question: 'What genre uses terms like "swing", "bebop" and "blues"?', options: ['Classical', 'Country', 'Jazz', 'Rock'], answer: 2, difficulty: 'easy', category: 'music', funFact: 'Jazz originated in New Orleans in the late 19th and early 20th century.' },
    { question: 'What does "R&B" stand for?',                       options: ['Rock and Blues', 'Rhythm and Blues', 'Rock and Bass', 'Rap and Beats'], answer: 1, difficulty: 'easy', category: 'music', explanation: 'Rhythm and Blues (R&B) originated in African American communities in the 1940s as a blend of jazz, gospel, and blues.' },
    { question: 'Which country does the Tango originate from?',    options: ['Spain', 'Brazil', 'Cuba', 'Argentina'], answer: 3, difficulty: 'medium', category: 'music', explanation: 'The Tango originated in the working-class port areas of Buenos Aires, Argentina in the late 19th century.' },
    { question: 'What does the musical term "forte" mean?',         options: ['Soft', 'Loud', 'Fast', 'Slow'], answer: 1, difficulty: 'medium', category: 'music', explanation: 'Forte (f) is an Italian musical term meaning loud or strong, as opposed to piano (p) which means soft.' },
    { question: 'How many valves does a standard trumpet have?',   options: ['2', '3', '4', '5'], answer: 1, difficulty: 'medium', category: 'music', explanation: 'A standard trumpet has 3 valves (pistons) that are pressed in combinations to produce different notes.' },
    { question: 'What is "a cappella" singing?',                   options: ['Singing in Italian', 'Singing without instrumental accompaniment', 'Singing in a choir only', 'Singing in rounds'], answer: 1, difficulty: 'medium', category: 'music', explanation: '"A cappella" is Italian for "in the chapel style" — singing or chanting without instrumental accompaniment.' },
    { question: 'Which musician is known as "The Boss"?',           options: ['Bob Dylan', 'Bruce Springsteen', 'Billy Joel', 'Tom Petty'], answer: 1, difficulty: 'medium', category: 'music', explanation: 'Bruce Springsteen earned the nickname "The Boss" from his habit of collecting and distributing gig money to his band.' },
    { question: 'What musical notation symbol indicates the volume should gradually decrease?', options: ['Crescendo', 'Staccato', 'Decrescendo', 'Legato'], answer: 2, difficulty: 'hard', category: 'music', explanation: 'Decrescendo (or diminuendo) means to gradually decrease in volume, often shown as > or with the Italian marking "dim.".' },
    { question: 'Who founded Motown Records?',                      options: ['Sam Cooke', 'Berry Gordy', 'Ray Charles', 'James Brown'], answer: 1, difficulty: 'hard', category: 'music', explanation: 'Berry Gordy founded Motown Records in Detroit, Michigan in 1959; it became the most successful Black-owned business of its era.' },
    { question: 'Which instrument has black and white keys and is struck by hammers internally?', options: ['Harpsichord', 'Organ', 'Piano', 'Clavichord'], answer: 2, difficulty: 'easy', category: 'music', explanation: 'The piano (pianoforte) uses felt-covered hammers to strike strings when keys are pressed, allowing dynamic variation.' },
    { question: 'How many semitones are in a chromatic octave?',   options: ['8', '10', '12', '16'], answer: 2, difficulty: 'hard', category: 'music', explanation: 'The chromatic scale has 12 semitones (half steps) per octave, encompassing all keys (white and black) on a piano.' }
  ];

  // ─── Food & Cooking Questions ───────────────────────────────────────────────
  const foodQuestions = [
    { question: 'What is the main ingredient in hummus?',           options: ['Lentils', 'Chickpeas', 'Black beans', 'Kidney beans'], answer: 1, difficulty: 'easy', category: 'food', funFact: 'Hummus means "chickpeas" in Arabic!' },
    { question: 'Which country invented pizza?',                    options: ['Spain', 'Greece', 'Italy', 'France'], answer: 2, difficulty: 'easy', category: 'food', funFact: 'Pizza originated in Naples, Italy in the 18th century.' },
    { question: 'What ingredient makes bread rise?',                options: ['Baking powder', 'Yeast', 'Salt', 'Butter'], answer: 1, difficulty: 'easy', category: 'food', explanation: 'Yeast is a microorganism that ferments sugars, producing carbon dioxide gas that makes bread dough rise.' },
    { question: 'The Scoville scale measures what property of food?', options: ['Sweetness', 'Acidity', 'Spiciness', 'Saltiness'], answer: 2, difficulty: 'medium', category: 'food', funFact: 'Pure capsaicin scores 16,000,000 on the Scoville scale!' },
    { question: 'What is sushi traditionally wrapped in?',          options: ['Rice paper', 'Nori (seaweed)', 'Lettuce', 'Banana leaf'], answer: 1, difficulty: 'easy', category: 'food', explanation: 'Nori is dried and pressed seaweed used to wrap maki rolls; the word "sushi" refers to the seasoned rice, not the fish.' },
    { question: 'Which spice is the most expensive by weight?',     options: ['Vanilla', 'Cardamom', 'Saffron', 'Truffle'], answer: 2, difficulty: 'medium', category: 'food', funFact: 'Saffron requires about 75,000 flowers to produce 1 pound of spice!' },
    { question: 'Gouda and Brie are types of what?',                options: ['Bread', 'Wine', 'Cheese', 'Butter'], answer: 2, difficulty: 'easy', category: 'food', explanation: 'Gouda is a semi-hard Dutch cheese, while Brie is a soft French cheese — both are popular varieties worldwide.' },
    { question: 'What is the main ingredient in guacamole?',        options: ['Tomato', 'Onion', 'Avocado', 'Lime'], answer: 2, difficulty: 'easy', category: 'food', explanation: 'Guacamole is a Mexican dip made primarily from mashed avocados, with lime juice, salt, and various seasonings.' },
    { question: 'Which country is famous for originating sushi?',   options: ['China', 'Korea', 'Vietnam', 'Japan'], answer: 3, difficulty: 'easy', category: 'food', explanation: 'Sushi originated in Japan; the modern form of nigiri sushi was developed in Tokyo (then Edo) in the early 19th century.' },
    { question: 'How many teaspoons are in one tablespoon?',        options: ['2', '3', '4', '5'], answer: 1, difficulty: 'easy', category: 'food', explanation: 'One tablespoon equals exactly 3 teaspoons in both US and UK measurement systems.' },
    { question: 'What herb is the key ingredient in traditional pesto?', options: ['Parsley', 'Basil', 'Oregano', 'Thyme'], answer: 1, difficulty: 'easy', category: 'food', funFact: 'Classic pesto from Genoa also contains pine nuts, Parmesan, garlic and olive oil.' },
    { question: 'What does "al dente" mean in Italian cooking?',   options: ['Well done', 'Firm to the bite', 'Very soft', 'Lightly coated'], answer: 1, difficulty: 'medium', category: 'food', explanation: '"Al dente" means pasta is cooked so it still has a slight firmness when bitten — considered ideal in Italian cuisine.' },
    { question: 'Which fruit is technically classified as a berry?', options: ['Strawberry', 'Raspberry', 'Banana', 'Cherry'], answer: 2, difficulty: 'hard', category: 'food', funFact: 'Botanically, bananas, avocados, and even watermelons are berries!' },
    { question: 'What cooking method involves submerging food in 180°C+ oil?', options: ['Poaching', 'Steaming', 'Deep frying', 'Braising'], answer: 2, difficulty: 'easy', category: 'food', explanation: 'Deep frying submerges food in hot oil (180–190°C), creating a crispy exterior while cooking the inside rapidly.' },
    { question: 'Which country\'s cuisine features kimchi and bibimbap?', options: ['Japan', 'China', 'Korea', 'Thailand'], answer: 2, difficulty: 'easy', category: 'food', funFact: 'Kimchi is a UNESCO-listed cultural heritage of South Korea!' },
    { question: 'Which country is the world\'s largest producer of coffee?', options: ['Colombia', 'Vietnam', 'Ethiopia', 'Brazil'], answer: 3, difficulty: 'medium', category: 'food', explanation: 'Brazil produces about 35% of the world\'s coffee, making it the largest producer for over 150 consecutive years.' },
    { question: 'What is feta cheese traditionally made from?',     options: ['Cow\'s milk', 'Goat\'s milk', 'Sheep\'s milk', 'Buffalo milk'], answer: 2, difficulty: 'hard', category: 'food', explanation: 'Traditional Greek feta is made from sheep\'s milk (or a blend with up to 30% goat\'s milk) and has EU Protected Designation of Origin.' },
    { question: 'Which nut is used to make marzipan?',              options: ['Walnut', 'Hazelnut', 'Pistachio', 'Almond'], answer: 3, difficulty: 'medium', category: 'food', explanation: 'Marzipan is a confection made from ground almonds, sugar, and egg whites; it is often used to make decorative cake coverings.' },
    { question: 'What does "MSG" stand for in cooking?',            options: ['Monosodium Glutamate', 'Mixed Sodium Glycol', 'Mono-Savoury Granules', 'Modified Salt Grain'], answer: 0, difficulty: 'medium', category: 'food', explanation: 'MSG (Monosodium Glutamate) is a flavour enhancer that intensifies the savoury "umami" taste in food.' },
    { question: 'What temperature does water freeze at in Fahrenheit?', options: ['0°F', '20°F', '32°F', '40°F'], answer: 2, difficulty: 'easy', category: 'food', explanation: 'Water freezes at 32°F (0°C); the Fahrenheit scale was defined so water freezes at 32 and boils at 212.' },
    { question: 'Which cooking technique seals food in a vacuum bag and cooks it in water?', options: ['En papillote', 'Braising', 'Sous vide', 'Blanching'], answer: 2, difficulty: 'hard', category: 'food', explanation: 'Sous vide (French for "under vacuum") cooks vacuum-sealed food in precisely temperature-controlled water, ensuring even, consistent results.' },
    { question: 'What is the main ingredient in a traditional Bolognese sauce?', options: ['Chicken', 'Pork sausage', 'Minced beef', 'Lamb'], answer: 2, difficulty: 'medium', category: 'food', explanation: 'Traditional Bolognese (Ragù alla Bolognese) from Bologna, Italy, is a slow-cooked meat sauce made with minced beef, vegetables, and wine.' },
    { question: 'What is the primary ingredient in tofu?',           options: ['Rice', 'Chickpeas', 'Soya beans', 'Lentils'], answer: 2, difficulty: 'easy', category: 'food', explanation: 'Tofu is made by coagulating soy milk (from soya beans) and pressing the curds into solid white blocks.' },
    { question: 'Which country invented champagne?',                options: ['Italy', 'Spain', 'Germany', 'France'], answer: 3, difficulty: 'easy', category: 'food', explanation: 'Champagne is a sparkling wine that can only be called "Champagne" if it comes from the Champagne region of France.' },
    { question: 'What is the Maillard reaction in cooking?',        options: ['Water evaporating from food', 'Fat melting under heat', 'Browning reaction between amino acids and sugars', 'Protein coagulation in eggs'], answer: 2, difficulty: 'hard', category: 'food', explanation: 'The Maillard reaction is a chemical process between amino acids and reducing sugars that gives browned food its distinctive flavour.' }
  ];

  // ─── Movies & TV Questions ─────────────────────────────────────────────────
  const moviesQuestions = [
    { question: 'Which film won the first ever Academy Award for Best Picture?', options: ['Sunrise', 'Wings', 'The Jazz Singer', 'Ben-Hur'], answer: 1, difficulty: 'hard', category: 'movies', funFact: '"Wings" (1927) won the first Best Picture Oscar at the inaugural Academy Awards in 1929.' },
    { question: 'What is the highest-grossing film of all time (unadjusted for inflation)?', options: ['Titanic', 'Avengers: Endgame', 'Avatar', 'The Lion King'], answer: 2, difficulty: 'medium', category: 'movies', funFact: 'Avatar (2009, re-released 2022) holds the record with over $2.9 billion worldwide.' },
    { question: 'In which city is the TV series "Breaking Bad" set?', options: ['Phoenix', 'El Paso', 'Albuquerque', 'Denver'], answer: 2, difficulty: 'easy', category: 'movies', explanation: 'Breaking Bad is set in Albuquerque, New Mexico; creator Vince Gilligan was inspired by the city\'s desert landscape.' },
    { question: 'Which actor played James Bond the most times?',    options: ['Sean Connery', 'Roger Moore', 'Daniel Craig', 'Pierce Brosnan'], answer: 1, difficulty: 'medium', category: 'movies', funFact: 'Roger Moore played Bond 7 times between 1973 and 1985.' },
    { question: 'What does the "DC" in DC Comics stand for?',       options: ['Digital Comics', 'Detective Comics', 'Dynamic Comics', 'Destiny Comics'], answer: 1, difficulty: 'medium', category: 'movies', explanation: 'DC Comics stands for Detective Comics, Inc. — named after their 1937 title that introduced Batman.' },
    { question: 'Which actress has won the most Academy Awards for Best Actress?', options: ['Meryl Streep', 'Katharine Hepburn', 'Cate Blanchett', 'Bette Davis'], answer: 1, difficulty: 'hard', category: 'movies', funFact: 'Katharine Hepburn won 4 Academy Awards for Best Actress.' },
    { question: '"Game of Thrones" is based on books by which author?', options: ['J.R.R. Tolkien', 'George R.R. Martin', 'Terry Pratchett', 'Neil Gaiman'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'Game of Thrones is based on George R.R. Martin\'s A Song of Ice and Fire novels, beginning with 1996\'s A Game of Thrones.' },
    { question: 'Which film features the quote "I\'ll be back"?',   options: ['RoboCop', 'Total Recall', 'The Terminator', 'Predator'], answer: 2, difficulty: 'easy', category: 'movies', explanation: 'Arnold Schwarzenegger delivered this iconic line as the T-800 cyborg in James Cameron\'s The Terminator (1984).' },
    { question: 'What is the name of the fictional African country in "Black Panther"?', options: ['Zamunda', 'Genovia', 'Wakanda', 'Latveria'], answer: 2, difficulty: 'easy', category: 'movies', explanation: 'Wakanda is the technologically advanced fictional African nation, home of the vibranium-powered Black Panther.' },
    { question: 'How many seasons does the TV series "Friends" have?', options: ['8', '9', '10', '11'], answer: 2, difficulty: 'easy', category: 'movies', funFact: 'Friends ran for 10 seasons from 1994 to 2004.' },
    { question: 'Which studio produced the film "Toy Story"?',      options: ['DreamWorks', 'Disney', 'Pixar', 'Universal'], answer: 2, difficulty: 'easy', category: 'movies', funFact: 'Toy Story (1995) was the first fully computer-animated feature film.' },
    { question: 'Who played Hannibal Lecter in "The Silence of the Lambs"?', options: ['Anthony Perkins', 'Anthony Hopkins', 'Jack Nicholson', 'Gary Oldman'], answer: 1, difficulty: 'medium', category: 'movies', explanation: 'Anthony Hopkins won the Academy Award for Best Actor for his chilling portrayal of Hannibal Lecter in the 1991 film.' },
    { question: 'Which country produces the most films annually?',  options: ['United States', 'China', 'Nigeria', 'India'], answer: 3, difficulty: 'hard', category: 'movies', funFact: 'India\'s Bollywood produces more films per year than Hollywood!' },
    { question: 'The TV series "The Crown" is about which royal family?', options: ['Spanish Royal Family', 'British Royal Family', 'Swedish Royal Family', 'Dutch Royal Family'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'The Crown (Netflix) dramatises the life of Queen Elizabeth II and the British Royal Family from 1947 onwards.' },
    { question: 'Which film franchise features the character "Dominic Toretto"?', options: ['Mission Impossible', 'Fast & Furious', 'Die Hard', 'The Expendables'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'Vin Diesel plays Dominic Toretto, a street racer turned heist driver, across the Fast & Furious franchise from 2001.' },
    { question: 'In what year was the first Star Wars film released?', options: ['1975', '1977', '1979', '1981'], answer: 1, difficulty: 'medium', category: 'movies', explanation: 'Star Wars: A New Hope was released on May 25, 1977, and became the highest-grossing film at the time.' },
    { question: 'Who directed "Jurassic Park"?',                    options: ['James Cameron', 'George Lucas', 'Steven Spielberg', 'Ridley Scott'], answer: 2, difficulty: 'easy', category: 'movies', explanation: 'Steven Spielberg directed Jurassic Park (1993), based on Michael Crichton\'s novel, using groundbreaking CGI effects.' },
    { question: 'Which colour pill did Neo choose in "The Matrix"?', options: ['Blue', 'Red', 'Green', 'White'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'Neo chose the red pill, which revealed the truth about the Matrix; the blue pill would have returned him to blissful ignorance.' },
    { question: 'Who played Captain Jack Sparrow in Pirates of the Caribbean?', options: ['Brad Pitt', 'Johnny Depp', 'Orlando Bloom', 'Geoffrey Rush'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'Johnny Depp created the iconic, eccentric Captain Jack Sparrow in the Pirates of the Caribbean franchise from 2003.' },
    { question: 'What does CGI stand for in film production?',      options: ['Computer Generated Images', 'Computer Generated Imagery', 'Computer Graphics Integration', 'Creative Graphics Interface'], answer: 1, difficulty: 'easy', category: 'movies', explanation: 'CGI (Computer Generated Imagery) is the use of computer graphics to create or enhance visual effects in films and media.' },
    { question: 'Which Netflix show features a battle against the "Upside Down"?', options: ['Dark', 'Squid Game', 'Stranger Things', 'The OA'], answer: 2, difficulty: 'easy', category: 'movies', explanation: 'Stranger Things (2016–) is set in Hawkins, Indiana, where children encounter supernatural threats from the parallel dimension called the Upside Down.' },
    { question: 'Who played Tony Montana in "Scarface" (1983)?',    options: ['Robert De Niro', 'Al Pacino', 'James Caan', 'Joe Pesci'], answer: 1, difficulty: 'medium', category: 'movies', explanation: 'Al Pacino played Cuban immigrant Tony Montana in Brian De Palma\'s Scarface (1983), delivering the iconic line "Say hello to my little friend."' },
    { question: 'What was the first feature film to use computer-generated characters?', options: ['Tron', 'The Abyss', 'Terminator 2', 'Jurassic Park'], answer: 0, difficulty: 'hard', category: 'movies', explanation: 'Tron (1982) was the first feature film to use extensive CGI, with approximately 15–20 minutes of computer-generated imagery.' },
    { question: 'Which film\'s famous shower scene is considered one of the greatest in cinema history?', options: ['Carrie', 'Psycho', 'Halloween', 'Friday the 13th'], answer: 1, difficulty: 'medium', category: 'movies', explanation: 'The shower scene in Alfred Hitchcock\'s Psycho (1960) is one of the most studied and referenced sequences in film history.' },
    { question: 'Which song plays over the opening credits of the James Bond film "Skyfall"?', options: ['You Only Live Twice', 'Goldfinger', 'Skyfall', 'Writing\'s on the Wall'], answer: 2, difficulty: 'medium', category: 'movies', explanation: '"Skyfall" was performed by Adele for the 2012 James Bond film of the same name; it won the Academy Award for Best Original Song.' }
  ];


  // ─── Uganda Enhanced Questions (extra pool on top of base ugandaQuestions) ─
  const ugandaEnhancedQuestions = [
    { question: 'What is the name of Uganda\'s parliament building?',         options: ['Uganda House', 'Parliament Hill', 'Parliament of Uganda', 'The State House'], answer: 2, difficulty: 'medium', category: 'government', explanation: 'The Parliament of Uganda is the legislative body, located in Kampala, and the building is officially named Parliament House.' },
    { question: 'Which Ugandan city is known as the "Garden City"?',         options: ['Entebbe', 'Kampala', 'Jinja', 'Gulu'], answer: 1, difficulty: 'medium', category: 'geography', funFact: 'Kampala sits on multiple hills and is famous for its greenery!' },
    { question: 'Lake Victoria is shared between Uganda and which two other countries?', options: ['Kenya and Tanzania', 'Kenya and Rwanda', 'Tanzania and DRC', 'South Sudan and Kenya'], answer: 0, difficulty: 'hard', category: 'geography', funFact: 'Lake Victoria is Africa\'s largest lake by area.' },
    { question: 'What is Uganda\'s national bird?',                           options: ['African Fish Eagle', 'Grey Crowned Crane', 'Marabou Stork', 'African Hornbill'], answer: 1, difficulty: 'medium', category: 'culture', funFact: 'The Grey Crowned Crane appears on Uganda\'s flag and coat of arms!' },
    { question: 'Which Ugandan athlete won gold at the 2020 Tokyo Olympics?', options: ['Joshua Cheptegei', 'Peruth Chemutai', 'Jacob Kiplimo', 'Halimah Nakaayi'], answer: 1, difficulty: 'hard', category: 'sports', funFact: 'Peruth Chemutai won gold in the 3000m steeplechase — Uganda\'s first female Olympic gold!' },
    { question: 'The Baha\'i House of Worship in Kampala is one of how many in the world?', options: ['5', '7', '8', '10'], answer: 2, difficulty: 'hard', category: 'religion', funFact: 'There are 8 Baha\'i Houses of Worship worldwide; Kampala\'s opened in 1961.' },
    { question: 'What is the name of Uganda\'s tallest mountain?',            options: ['Mount Kenya', 'Mount Elgon', 'Margherita Peak (Rwenzori)', 'Mount Moroto'], answer: 2, difficulty: 'hard', category: 'geography', funFact: 'Margherita Peak on the Rwenzori Mountains stands at 5,109m above sea level.' },
    { question: 'Which Ugandan king was exiled by the British in 1953?',      options: ['Kabaka Mwanga', 'Kabaka Mutesa II', 'Kabaka Chwa II', 'Kabaka Daudi Cwa'], answer: 1, difficulty: 'hard', category: 'history', funFact: 'Kabaka Mutesa II of Buganda was exiled but later became Uganda\'s first President.' },
    { question: 'What does "Webale nyo" mean in Luganda?',                   options: ['Good morning', 'Welcome', 'Thank you very much', 'God bless you'], answer: 2, difficulty: 'hard', category: 'culture', explanation: '"Webale nyo" is Luganda for "thank you very much", a deeper expression of gratitude than "webale" alone.' },
    { question: 'Which Ugandan road connects Kampala to Entebbe Airport?',   options: ['Northern Bypass', 'Southern Expressway', 'Entebbe Expressway', 'Kampala-Entebbe Highway'], answer: 2, difficulty: 'medium', category: 'geography', funFact: 'The Entebbe Expressway opened in 2018 — Uganda\'s first modern expressway.' }
  ];

  // ─── Default Personality Questions ─────────────────────────────────────────
  const defaultPersonalityQuestions = [
    {
      question: 'How do you typically approach a new project?',
      options: ['Take charge and create a plan immediately', 'Analyze all available information first', 'Discuss with others to get their input', 'Brainstorm creative possibilities'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 1 },
        { leader: 1, thinker: 3, social: 0, intuitive: 1 },
        { leader: 0, thinker: 1, social: 3, intuitive: 1 },
        { leader: 1, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'In a group setting, you are most likely to:',
      options: ['Take the lead and organize everyone', 'Observe and analyze the group dynamics', 'Focus on making sure everyone feels included', 'Suggest creative ideas and possibilities'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 0, thinker: 3, social: 1, intuitive: 0 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 1, thinker: 0, social: 0, intuitive: 3 }
      ]
    },
    {
      question: 'When making an important decision, you typically:',
      options: ['Make a quick, confident choice based on experience', 'Carefully analyze all options and their consequences', 'Consider how it will affect others involved', 'Trust your gut feeling about what feels right'],
      personalityPoints: [
        { leader: 3, thinker: 0, social: 0, intuitive: 1 },
        { leader: 1, thinker: 3, social: 0, intuitive: 0 },
        { leader: 0, thinker: 1, social: 3, intuitive: 0 },
        { leader: 0, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'Your ideal work environment is:',
      options: ['Fast-paced with opportunities to lead projects', 'Organized with clear processes and intellectual challenges', 'Collaborative with a strong team culture', 'Flexible and open to innovation and creativity'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 1, thinker: 3, social: 0, intuitive: 0 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 0, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'When facing a challenge, you typically:',
      options: ['Take immediate action to solve it', 'Analyze the problem thoroughly before acting', 'Discuss it with others to get different perspectives', 'Look for creative, unconventional solutions'],
      personalityPoints: [
        { leader: 3, thinker: 0, social: 0, intuitive: 1 },
        { leader: 0, thinker: 3, social: 1, intuitive: 0 },
        { leader: 0, thinker: 1, social: 3, intuitive: 0 },
        { leader: 1, thinker: 0, social: 0, intuitive: 3 }
      ]
    },
    {
      question: 'In your free time, you prefer to:',
      options: ['Engage in competitive activities or sports', 'Read, learn, or solve puzzles', 'Spend time with friends and family', 'Explore creative hobbies or new experiences'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 0, thinker: 3, social: 0, intuitive: 1 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 1, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'When communicating, you tend to be:',
      options: ['Direct and to the point', 'Precise and logical', 'Diplomatic and considerate', 'Expressive and enthusiastic'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 1, thinker: 3, social: 0, intuitive: 0 },
        { leader: 0, thinker: 1, social: 3, intuitive: 0 },
        { leader: 0, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'Your greatest strength is:',
      options: ['Taking initiative and making things happen', 'Solving complex problems with logical thinking', 'Understanding people and building relationships', 'Seeing possibilities and thinking outside the box'],
      personalityPoints: [
        { leader: 3, thinker: 0, social: 0, intuitive: 1 },
        { leader: 0, thinker: 3, social: 0, intuitive: 1 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 1, thinker: 1, social: 0, intuitive: 3 }
      ]
    },
    {
      question: 'In a conflict situation, you typically:',
      options: ['Take charge to resolve it quickly and decisively', 'Analyze the facts objectively to find a logical solution', 'Focus on understanding everyone\'s feelings and finding harmony', 'Look for creative compromises that satisfy everyone'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 1, thinker: 3, social: 0, intuitive: 0 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 0, thinker: 0, social: 1, intuitive: 3 }
      ]
    },
    {
      question: 'You feel most fulfilled when you:',
      options: ['Accomplish goals and achieve success', 'Gain knowledge and solve difficult problems', 'Help others and build meaningful connections', 'Express your creativity and explore new ideas'],
      personalityPoints: [
        { leader: 3, thinker: 1, social: 0, intuitive: 0 },
        { leader: 1, thinker: 3, social: 0, intuitive: 0 },
        { leader: 0, thinker: 0, social: 3, intuitive: 1 },
        { leader: 0, thinker: 0, social: 1, intuitive: 3 }
      ]
    }
  ];

  // ─── Public API ─────────────────────────────────────────────────────────────
  function getQuestions(topicId) {
    switch (topicId) {
      case 'uganda':        return ugandaQuestions.concat(ugandaEnhancedQuestions);
      case 'history':       return historyQuestions;
      case 'geography':     return geographyQuestions;
      case 'science':       return scienceQuestions;
      case 'entertainment': return entertainmentQuestions;
      case 'technology':    return technologyQuestions;
      case 'sports':        return sportsQuestions;
      case 'music':         return musicQuestions;
      case 'food':          return foodQuestions;
      case 'movies':        return moviesQuestions;
      case 'general':
      default:              return generalQuestions;
    }
  }

  /**
   * Get a randomised subset of questions for a topic, optionally filtered by difficulty.
   * Falls back to full pool if not enough questions match the requested difficulty.
   * @param {string} topicId   - Topic identifier
   * @param {number} count     - How many questions to return (default 10)
   * @param {string} difficulty - 'easy' | 'medium' | 'hard' | null/undefined for all
   * @returns {Array} Shuffled array of `count` questions
   */
  function getRandomQuestions(topicId, count, difficulty) {
    count = count || 10;
    var all = getQuestions(topicId);
    var pool = all;

    if (difficulty && difficulty !== 'all') {
      var filtered = all.filter(function(q) { return q.difficulty === difficulty; });
      // Only use the filtered pool if it has enough questions (at least half of count)
      if (filtered.length >= Math.ceil(count / 2)) {
        pool = filtered;
      }
    }

    // Fisher-Yates shuffle on a copy
    var shuffled = pool.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /** Get available difficulty levels with counts for a topic */
  function getDifficultyCounts(topicId) {
    var all = getQuestions(topicId);
    var counts = { easy: 0, medium: 0, hard: 0, all: all.length };
    all.forEach(function(q) {
      if (q.difficulty === 'easy')   counts.easy++;
      else if (q.difficulty === 'medium') counts.medium++;
      else if (q.difficulty === 'hard')   counts.hard++;
    });
    return counts;
  }

  function getPersonalityQuestions()     { return defaultPersonalityQuestions; }
  function getDefaultPersonalityTypes()  { return defaultPersonalityTypes; }
  function getDefaultTopics()            { return defaultTopics.map(t => Object.assign({}, t)); }

  return { getQuestions, getPersonalityQuestions, getDefaultPersonalityTypes, getDefaultTopics, getRandomQuestions, getDifficultyCounts };

})();
