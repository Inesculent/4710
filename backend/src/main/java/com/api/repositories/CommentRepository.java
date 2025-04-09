package com.api.repositories;

import com.api.models.Comment;
import com.api.models.CommentId;
import com.api.models.Event;
import com.api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, CommentId> {
    List<Comment> findByEvent(Event event);
    List<Comment> findByUser(User user);
    void deleteByEventAndUser(Event event, User user);
} 