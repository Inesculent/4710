package com.api.services;

import com.api.models.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    Optional<User> getUserById(Integer id);
    Optional<User> getUserByEmail(String email);
    User createUser(User user);
    User updateUser(Integer id, User user);
    void deleteUser(Integer id);
    boolean verifyLogin(String email, String password);
} 