<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use PDO;

abstract class TestCase extends BaseTestCase
{
    /**
     * Nama database MySQL khusus testing (terpisah dari database development).
     */
    protected const MYSQL_TEST_DATABASE = 'khodamku_test';

    /**
     * Jika driver pdo_sqlite tidak tersedia, gunakan database MySQL terpisah
     * agar RefreshDatabase tidak menyentuh database development.
     */
    public function createApplication(): Application
    {
        $app = parent::createApplication();

        if (! extension_loaded('pdo_sqlite')) {
            $this->useMysqlTestDatabase($app);
        }

        return $app;
    }

    protected function useMysqlTestDatabase(Application $app): void
    {
        $config = $app['config']->get('database.connections.mysql');

        $host = $config['host'] ?? '127.0.0.1';
        $port = $config['port'] ?? '3306';

        try {
            $pdo = new PDO(
                "mysql:host={$host};port={$port}",
                $config['username'] ?? 'root',
                $config['password'] ?? '',
            );
            $pdo->exec('CREATE DATABASE IF NOT EXISTS `'.self::MYSQL_TEST_DATABASE.'`');
        } catch (\PDOException) {
            $app['config']->set('database.default', 'sqlite');
            $app['config']->set('database.connections.mysql.database', ':memory:');

            return;
        }

        $app['config']->set('database.default', 'mysql');
        $app['config']->set('database.connections.mysql.database', self::MYSQL_TEST_DATABASE);
        $app['config']->set('database.connections.mysql.url', null);
    }
}
