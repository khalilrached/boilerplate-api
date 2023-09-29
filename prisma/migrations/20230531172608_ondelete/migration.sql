-- DropForeignKey
ALTER TABLE `users_games` DROP FOREIGN KEY `users_games_game_id_fkey`;

-- DropForeignKey
ALTER TABLE `users_games` DROP FOREIGN KEY `users_games_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `users_games` ADD CONSTRAINT `users_games_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users_games` ADD CONSTRAINT `users_games_game_id_fkey` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
