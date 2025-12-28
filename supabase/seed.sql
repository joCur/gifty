-- Gifty Development Seed Data
-- This file seeds the database with test users and data for development
-- Run with: supabase db reset (which runs migrations + seed)

-- ============================================
-- TEST USERS
-- ============================================
-- All test users have the password: password123

-- Define user UUIDs for reference
DO $$
DECLARE
  remi_id UUID := '11111111-1111-1111-1111-111111111111';
  alice_id UUID := '22222222-2222-2222-2222-222222222222';
  bob_id UUID := '33333333-3333-3333-3333-333333333333';
  charlie_id UUID := '44444444-4444-4444-4444-444444444444';
  diana_id UUID := '55555555-5555-5555-5555-555555555555';

  -- Wishlist UUIDs
  remi_birthday_list UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  remi_christmas_list UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  alice_wishlist UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  bob_wishlist UUID := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  charlie_wishlist UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  diana_wishlist UUID := 'ffffffff-ffff-ffff-ffff-ffffffffffff';

  -- Item UUIDs (for claims)
  remi_item_1 UUID := '11111111-aaaa-aaaa-aaaa-111111111111';
  remi_item_2 UUID := '22222222-aaaa-aaaa-aaaa-222222222222';
  remi_item_3 UUID := '33333333-aaaa-aaaa-aaaa-333333333333';
  alice_item_1 UUID := '11111111-cccc-cccc-cccc-111111111111';
  bob_item_1 UUID := '11111111-dddd-dddd-dddd-111111111111';

BEGIN
  -- ============================================
  -- CREATE AUTH USERS
  -- ============================================
  -- Insert users into auth.users (profiles will be auto-created via trigger)

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token
  ) VALUES
  -- Remi (main test user)
  (
    remi_id,
    '00000000-0000-0000-0000-000000000000',
    'remi@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Remi"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  -- Alice
  (
    alice_id,
    '00000000-0000-0000-0000-000000000000',
    'alice@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Alice"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  -- Bob
  (
    bob_id,
    '00000000-0000-0000-0000-000000000000',
    'bob@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Bob"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  -- Charlie
  (
    charlie_id,
    '00000000-0000-0000-0000-000000000000',
    'charlie@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Charlie"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '', '', '', '', '', '', '', ''
  ),
  -- Diana
  (
    diana_id,
    '00000000-0000-0000-0000-000000000000',
    'diana@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"display_name": "Diana"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated',
    '', '', '', '', '', '', '', ''
  );

  -- ============================================
  -- UPDATE PROFILES WITH ADDITIONAL DATA
  -- ============================================
  -- The trigger creates basic profiles, let's add more details

  UPDATE profiles SET
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=remi',
    birthday = '1995-06-15'
  WHERE id = remi_id;

  UPDATE profiles SET
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    birthday = '1992-03-22'
  WHERE id = alice_id;

  UPDATE profiles SET
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    birthday = '1990-11-08'
  WHERE id = bob_id;

  UPDATE profiles SET
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    birthday = '1998-07-30'
  WHERE id = charlie_id;

  UPDATE profiles SET
    avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana',
    birthday = '1994-12-25'
  WHERE id = diana_id;

  -- ============================================
  -- CREATE WISHLISTS
  -- ============================================

  INSERT INTO wishlists (id, user_id, name, description, privacy) VALUES
  -- Remi's wishlists
  (remi_birthday_list, remi_id, 'Birthday Wishlist', 'Things I want for my birthday!', 'friends'),
  (remi_christmas_list, remi_id, 'Christmas 2024', 'Ho ho ho! Christmas gift ideas', 'friends'),

  -- Alice's wishlist
  (alice_wishlist, alice_id, 'Alice''s Favorites', 'My favorite things I''d love to receive', 'friends'),

  -- Bob's wishlist
  (bob_wishlist, bob_id, 'Bob''s Tech Gadgets', 'All the tech stuff I want', 'friends'),

  -- Charlie's wishlist
  (charlie_wishlist, charlie_id, 'Charlie''s Books', 'Books on my reading list', 'public'),

  -- Diana's wishlist (private - only she can see)
  (diana_wishlist, diana_id, 'Diana''s Secret List', 'Shhh, this is private!', 'private');

  -- ============================================
  -- CREATE WISHLIST ITEMS
  -- ============================================

  -- Remi's Birthday Wishlist items
  INSERT INTO wishlist_items (id, wishlist_id, url, title, description, image_url, price, currency, notes) VALUES
  (remi_item_1, remi_birthday_list,
   'https://www.apple.com/airpods-pro/',
   'AirPods Pro 2',
   'The latest AirPods Pro with USB-C',
   'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=572&hei=572&fmt=jpeg&qlt=95',
   '249.00', 'EUR', 'Would love the white ones!'),

  (remi_item_2, remi_birthday_list,
   'https://www.nintendo.com/switch/',
   'Nintendo Switch OLED',
   'Gaming console with OLED screen',
   'https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_400/ncom/en_US/switch/site-design-update/oled-background',
   '349.99', 'EUR', NULL),

  (remi_item_3, remi_birthday_list,
   'https://www.amazon.com/dp/B09V3KXJPB',
   'Kindle Paperwhite',
   'E-reader with 6.8" display',
   'https://m.media-amazon.com/images/I/61DwCQsJ7GL._AC_SL1000_.jpg',
   '139.99', 'EUR', 'For all my reading!');

  -- Remi's Christmas Wishlist items
  INSERT INTO wishlist_items (wishlist_id, url, title, description, image_url, price, currency) VALUES
  (remi_christmas_list,
   'https://www.lego.com/product/millennium-falcon-75375',
   'LEGO Star Wars Millennium Falcon',
   'The classic spaceship in LEGO form',
   'https://www.lego.com/cdn/cs/set/assets/blt95d3e3be6b5c1e5a/75375.png',
   '84.99', 'EUR'),

  (remi_christmas_list,
   'https://www.sonos.com/en/shop/one.html',
   'Sonos One Smart Speaker',
   'Wireless speaker with voice control',
   'https://www.sonos.com/cdn/shop/products/one-sl-white-background.png',
   '219.00', 'EUR');

  -- Alice's wishlist items
  INSERT INTO wishlist_items (id, wishlist_id, url, title, description, image_url, price, currency) VALUES
  (alice_item_1, alice_wishlist,
   'https://www.ysl.com/en-en/bags/loulou/',
   'YSL Loulou Bag',
   'Classic quilted leather shoulder bag',
   'https://www.ysl.com/dw/image/v2/BGGB_PRD/on/demandware.static/Sites-SLP-EU-Site/Sites-ysl-master-catalog/default/bags.jpg',
   '2150.00', 'EUR'),

  (uuid_generate_v4(), alice_wishlist,
   'https://www.nespresso.com/vertuo-next',
   'Nespresso Vertuo Next',
   'Coffee machine for perfect espresso',
   'https://www.nespresso.com/shared_res/agility/global/machines/vertuo/vertuo-next-dark-grey.png',
   '159.00', 'EUR');

  -- Bob's wishlist items
  INSERT INTO wishlist_items (id, wishlist_id, url, title, description, image_url, price, currency, notes) VALUES
  (bob_item_1, bob_wishlist,
   'https://store.steampowered.com/steamdeck',
   'Steam Deck OLED',
   'Handheld gaming PC',
   'https://clan.akamai.steamstatic.com/images/39049601/a1a2d5e2d0c1e3f4e5b6a7b8c9d0e1f2.png',
   '569.00', 'EUR', 'The 1TB version please!'),

  (uuid_generate_v4(), bob_wishlist,
   'https://www.logitech.com/mx-master-3s',
   'Logitech MX Master 3S',
   'Premium wireless mouse',
   'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view.png',
   '99.99', 'EUR', NULL),

  (uuid_generate_v4(), bob_wishlist,
   'https://www.keychron.com/products/keychron-q1',
   'Keychron Q1 Mechanical Keyboard',
   'Custom mechanical keyboard',
   'https://cdn.shopify.com/s/files/1/0059/0630/1017/products/Keychron-Q1-keyboard.jpg',
   '169.00', 'EUR', NULL);

  -- Charlie's wishlist items (books)
  INSERT INTO wishlist_items (wishlist_id, url, title, description, image_url, price, currency) VALUES
  (charlie_wishlist,
   'https://www.amazon.com/dp/0143127551',
   'Sapiens: A Brief History of Humankind',
   'By Yuval Noah Harari',
   'https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg',
   '18.99', 'EUR'),

  (charlie_wishlist,
   'https://www.amazon.com/dp/0735211299',
   'Atomic Habits',
   'By James Clear',
   'https://m.media-amazon.com/images/I/81wgcld4wxL._AC_UF1000,1000_QL80_.jpg',
   '16.99', 'EUR'),

  (charlie_wishlist,
   'https://www.amazon.com/dp/0307887898',
   'The Lean Startup',
   'By Eric Ries',
   'https://m.media-amazon.com/images/I/81-QB7nDh4L._AC_UF1000,1000_QL80_.jpg',
   '14.99', 'EUR');

  -- Diana's wishlist items (private)
  INSERT INTO wishlist_items (wishlist_id, url, title, description, image_url, price, currency) VALUES
  (diana_wishlist,
   'https://www.cartier.com/love-bracelet',
   'Cartier Love Bracelet',
   'Iconic gold bracelet',
   'https://www.cartier.com/content/dam/rcq/car/16/20/90/8/1620908.png',
   '6900.00', 'EUR'),

  (diana_wishlist,
   'https://www.dyson.com/airwrap',
   'Dyson Airwrap',
   'Multi-styler hair tool',
   'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/airwrap.png',
   '549.00', 'EUR');

  -- ============================================
  -- CREATE FRIENDSHIPS
  -- ============================================
  -- Remi is friends with Alice and Bob (accepted)
  -- Charlie sent Remi a friend request (pending)
  -- Diana is friends with Alice (accepted)

  INSERT INTO friendships (requester_id, addressee_id, status) VALUES
  -- Remi <-> Alice (accepted)
  (remi_id, alice_id, 'accepted'),

  -- Remi <-> Bob (accepted)
  (bob_id, remi_id, 'accepted'),

  -- Charlie -> Remi (pending)
  (charlie_id, remi_id, 'pending'),

  -- Diana <-> Alice (accepted)
  (diana_id, alice_id, 'accepted'),

  -- Bob <-> Charlie (accepted)
  (bob_id, charlie_id, 'accepted');

  -- ============================================
  -- CREATE ITEM CLAIMS
  -- ============================================
  -- Alice claimed one of Remi's items
  -- Bob also claimed one of Remi's items

  INSERT INTO item_claims (item_id, claimed_by) VALUES
  -- Alice claimed Remi's AirPods
  (remi_item_1, alice_id),

  -- Bob claimed Remi's Kindle
  (remi_item_3, bob_id);

END $$;

-- ============================================
-- SUMMARY OF SEEDED DATA
-- ============================================
--
-- Users (all with password: password123):
--   - remi@test.com (Remi) - main test user
--   - alice@test.com (Alice)
--   - bob@test.com (Bob)
--   - charlie@test.com (Charlie)
--   - diana@test.com (Diana)
--
-- Friendships:
--   - Remi <-> Alice (accepted)
--   - Remi <-> Bob (accepted)
--   - Charlie -> Remi (pending request)
--   - Diana <-> Alice (accepted)
--   - Bob <-> Charlie (accepted)
--
-- Wishlists:
--   - Remi: "Birthday Wishlist" (3 items), "Christmas 2024" (2 items)
--   - Alice: "Alice's Favorites" (2 items)
--   - Bob: "Bob's Tech Gadgets" (3 items)
--   - Charlie: "Charlie's Books" (3 items) - PUBLIC
--   - Diana: "Diana's Secret List" (2 items) - PRIVATE
--
-- Item Claims:
--   - Alice claimed Remi's "AirPods Pro 2"
--   - Bob claimed Remi's "Kindle Paperwhite"
